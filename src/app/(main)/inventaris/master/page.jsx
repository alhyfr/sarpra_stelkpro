'use client'
import ProtectedRoute from '@/components/ProtectedRoute';
import DataInv from './DataInv';
export default function Master(){
    return(
        <>
          <ProtectedRoute>
            <DataInv />
          </ProtectedRoute>
       </>
    )
}