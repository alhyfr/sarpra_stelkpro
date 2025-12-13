'use client'
import { useState, useEffect } from 'react'
import api from '@/app/utils/Api'
import Slider from '@/helper/Slider'
import { motion, AnimatePresence } from 'framer-motion'


export default function Team() {
    const [teams, setTeams] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    
    const getTeams = async () => {
        try {
            const response = await api.get('/sp/teams')
            setTeams(response.data.data || [])
        } catch (error) {
            console.error('Error fetching teams:', error)
            setTeams([])
        }
    }
    
    useEffect(() => {
        getTeams()
    }, [])

    // Filter teams yang memiliki foto
    const teamsWithPhotos = teams.filter(team => team.foto_url || team.foto || team.gambar || team.image || team.avatar)
    
    // Extract images from teams data - prioritize foto_url, fallback to foto
    const teamImages = teamsWithPhotos.map(team => {
        // Prioritize foto_url if available, otherwise use foto or other fields
        return team.foto_url || team.foto || team.gambar || team.image || team.avatar
    })
    
    // Get current team data based on currentIndex
    const currentTeam = teamsWithPhotos[currentIndex] || null

    return (
        <div className="relative rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 overflow-hidden">
            {/* Modern Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
            
            {/* Animated Pattern Overlay */}
            <div className="absolute inset-0 opacity-30 dark:opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>
            </div>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
            
            {/* Content */}
            <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    IT, LAB, & SARPRA
                </h3>
                <div className="relative">
                    <Slider 
                        images={teamImages}
                        autoPlay={true}
                        interval={4000}
                        showDots={true}
                        showArrows={true}
                        height={250} // 350px untuk menampilkan foto dengan baik
                        objectFit="contain" // Menampilkan seluruh foto tanpa terpotong
                        onSlideChange={setCurrentIndex} // Callback untuk update currentIndex
                    />
                    
                    {/* Team Name Display */}
                    {currentTeam && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="mt-2 text-center"
                            >
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {currentTeam.nama || '-'}
                                </h4>
                                {currentTeam.jabatan && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {currentTeam.jabatan}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
            `}</style>
        </div>
    )
}