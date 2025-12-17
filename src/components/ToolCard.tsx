
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import styles from './ToolCard.module.css';

interface ToolCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color?: string;
}

export default function ToolCard({ title, description, icon: Icon, href, color = 'var(--accent-primary)' }: ToolCardProps) {
    return (
        <Link href={href} className={styles.card}>
            <div className={styles.iconWrapper} style={{ color: color }}>
                <Icon size={32} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
        </Link>
    );
}
