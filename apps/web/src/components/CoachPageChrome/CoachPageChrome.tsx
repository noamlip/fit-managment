import type { ReactNode } from 'react';
import './CoachPageChrome.scss';

interface Props {
    sectionTitle: string;
    children: ReactNode;
}

/** Slim section title only — active trainee lives in CoachContextBar */
export function CoachPageChrome({ sectionTitle, children }: Props) {
    return (
        <div className="coach-page-chrome">
            <h2 className="coach-page-chrome-title">{sectionTitle}</h2>
            <div className="coach-page-chrome-body">{children}</div>
        </div>
    );
}
