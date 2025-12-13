'use client'
import { Box, FileText, AlertCircle, Clock,Trash,Edit,LogIn,LogOut} from 'lucide-react';
import api from '@/app/utils/Api';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
export default function AktifitasTerbru() {
    const [activities, setActivities] = useState([]);
    const getActivities = async () => {
        const response = await api.get('/sp/aktifitas-limit');
        setActivities(response.data);
    }
    const akIcon = {
        delete: Trash,
        create: FileText,
        update: Edit,
        login: LogIn,
        logout: LogOut,
        default: Clock
    };
    
    const akColor = {
        delete: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        create: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        update: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        login: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        logout: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        default: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    };
    
    const getActivityIcon = (type) => {
        return akIcon[type] || akIcon.default;
    };
    
    const getActivityColor = (type) => {
        return akColor[type] || akColor.default;
    };
    useEffect(() => {
        getActivities();
    }, []);
    return (
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
            {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                    <div className="relative">
                        <div className={`p-2 rounded-full ring-4 ring-white dark:ring-gray-800 ${getActivityColor(activity.type)}`}>
                            {(() => {
                                const IconComponent = getActivityIcon(activity.type);
                                return <IconComponent className="w-4 h-4" />;
                            })()}
                        </div>
                        {index !== activities.length - 1 && (
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-200 dark:bg-gray-700 -z-10" />
                        )}
                    </div>
                    <div className="flex-1 pt-1">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {activity.username}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                {dayjs(activity.created_at).locale("id").fromNow()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.aktifitas}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}