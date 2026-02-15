import { IconType } from 'react-icons';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: IconType;
    details?: Array<{ label: string; value: string | number }>;
    footer?: { label: string; value: string | number };
    bgColor?: string;
    textColor?: string;
    iconColor?: string;
    titleColor?: string;
}

export default function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    details, 
    footer, 
    bgColor = 'bg-primary',
    textColor = 'text-white',
    iconColor,
    titleColor
}: StatCardProps) {
    return (
        <div className={`relative overflow-hidden ${bgColor} rounded-xl p-4 ${textColor} shadow-lg border border-primary/20`}>
            <div className="flex items-start justify-between relative z-10 mb-4">
                <div className="flex-1">
                    <p className={`${titleColor || `${textColor}/80`} text-xs font-medium mb-1`}>{title}</p>
                    <p className="text-3xl font-light tracking-tight">{value}</p>
                </div>
                <div className={`${iconColor || `${textColor}/30`} p-2`}>
                    <Icon size={16} />
                </div>
            </div>
            
            <div className="pointer-events-none absolute -bottom-2 -right-2 opacity-20">
                <div className="w-16 h-12 bg-gradient-to-br from-white to-transparent rounded-full blur-sm"></div>
            </div>

            {details && details.length > 0 && (
                <div className="border-t border-white/20 pt-3 relative z-10 space-y-1">
                    {details.map((detail, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                            <span className={`${textColor}/70`}>{detail.label}</span>
                            <span className={`font-semibold ${textColor}`}>{detail.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {footer && (
                <div className="border-t border-white/20 pt-3 relative z-10">
                    <div className="flex justify-between items-center text-xs">
                        <span className={`${textColor}/70`}>{footer.label}</span>
                        <span className={`font-semibold ${textColor}`}>{footer.value}</span>
                    </div>
                </div>
            )}
        </div>
    );
}