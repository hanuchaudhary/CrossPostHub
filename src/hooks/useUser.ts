import { useEffect } from 'react'
import { useUserStore } from '@/store/UserStore/useUserStore'
import { initializeAuthListener } from '@/lib/firebase'

export const useUser = () => {
  const { user, isLoading } = useUserStore()

  useEffect(() => {
    initializeAuthListener()
  }, [])

  return { user, isLoading }
}

