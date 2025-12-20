'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VersionNotifier() {
    const [currentVersion, setCurrentVersion] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchInitialVersion = async () => {
            if (currentVersion) return;

            try {
                const res = await fetch('/api/version', { cache: 'no-store' });
                const data = await res.json();
                if (isMounted) {
                    setCurrentVersion(data.version);
                }
            } catch (err) {
                console.error('Failed to fetch initial version:', err);
            }
        };

        fetchInitialVersion();

        const interval = setInterval(async () => {
            if (!currentVersion) return;

            try {
                const res = await fetch('/api/version', { cache: 'no-store' });
                const data = await res.json();

                if (data.version !== currentVersion) {
                    toast((t) => (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 font-medium">
                                <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                                <span>New Update Available!</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                A new version of KratoLib is available. Refresh to get the latest features.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toast.dismiss(t.id)}
                                >
                                    Later
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        window.location.reload();
                                    }}
                                >
                                    Refresh Now
                                </Button>
                            </div>
                        </div>
                    ), {
                        duration: Infinity,
                        position: 'top-center',
                    });

                    clearInterval(interval);
                }
            } catch (err) {
                console.error('Failed to check for version update:', err);
            }
        }, 1000 * 60 * 5); // Check every 5 minutes

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [currentVersion]);

    return null; // This component doesn't render anything itself
}
