import { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from '../services/api'

const AuthContext = createContext()

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    isAuthenticated: false,
}

const authReducer = (state, action) => {
    switch (action.type) {
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
            }
        case 'AUTH_LOGOUT':
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
            }
        case 'AUTH_LOADING':
            return {
                ...state,
                user: action.payload,
            }
        default:
            return state
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState)
    
    useEffect(() => {
        const checkAuth = async() => {
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const user = await authService.getProfile()
                    dispatch({
                        type: 'AUTH_SUCCESS',
                        payload: {user, token}
                    })
                } catch (error) {
                    dispatch({type: 'AUTH_LOGOUT'})
                }
            } else {
                dispatch({ type: 'AUTH_LOADING', payload: false})
            }
        }
        checkAuth()
    }, [])

    const login = async(credentials) => {
        try {
            const response = await authService.login(credentials)
            localStorage.setItem('token', response.access)
            localStorage.setItem('refreshToken', response.refresh)

            const user = await authService.getProfile()
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user, token: response.access}
            })
            return true
        } catch (err) {
            throw err
        }
    }

    const register = async(userData) => {
        try {
            await authService.register(userData)
            return true
        } catch (err) {
            throw err
        }
    }

    const logout = () => {
        dispatch({type: 'AUTH_LOGOUT'})
    }

    const updateUser = (userData) => {
        dispatch({type: 'UPDATE_USER', payload: userData})
    }

    const value = {
        ...state,
        login,
        register,
        logout,
        updateUser,
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}