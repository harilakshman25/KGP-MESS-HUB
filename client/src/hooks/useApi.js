import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    method = 'GET',
    body = null,
    dependencies = [],
    onSuccess,
    onError,
    immediate = true
  } = options

  const execute = async (customUrl = url, customOptions = {}) => {
    try {
      setLoading(true)
      setError(null)

      const config = {
        method: customOptions.method || method,
        ...customOptions
      }

      if (config.method !== 'GET' && (customOptions.body || body)) {
        config.data = customOptions.body || body
      }

      const response = await api({
        url: customUrl,
        ...config
      })

      setData(response)
      
      if (onSuccess) {
        onSuccess(response)
      }

      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)
      
      if (onError) {
        onError(err)
      } else {
        toast.error(errorMessage)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (immediate && url) {
      execute()
    }
  }, dependencies)

  const refetch = () => execute()

  return {
    data,
    loading,
    error,
    execute,
    refetch
  }
}

export default useApi
