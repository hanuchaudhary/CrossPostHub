import EditNavbar from '@/components/EditComponents/EditNavbar'
import React from 'react'

type Props = {
    children: React.ReactNode
}

export default function EditLayout({ children }: Props) {
    return (
        <div className='container mx-auto px-4 py-8'>
            <EditNavbar/>
            {children}
        </div>
    )
}
