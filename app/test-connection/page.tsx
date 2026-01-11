'use client';

import { useState } from 'react';
import { config } from '@/lib/config';

export default function TestConnectionPage() {
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [details, setDetails] = useState<any>(null);

    const testConnection = async () => {
        setStatus('testing');
        setMessage('Testing connection...');
        setDetails(null);

        try {
            const response = await fetch(`${config.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'test123',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('✅ Backend is reachable! (Login will fail without a valid user)');
            } else {
                setStatus('success');
                setMessage('✅ Backend is reachable! Got expected error response.');
            }

            setDetails({
                status: response.status,
                statusText: response.statusText,
                response: data,
            });
        } catch (error: any) {
            setStatus('error');
            setMessage('❌ Cannot connect to backend!');
            setDetails({
                error: error.message,
                apiUrl: config.apiUrl,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">
                        Backend Connection Test
                    </h1>

                    <div className="mb-6">
                        <p className="text-gray-600 mb-2">
                            <strong>Backend API URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{config.apiUrl}</code>
                        </p>
                        <p className="text-gray-600">
                            <strong>Frontend URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</code>
                        </p>
                    </div>

                    <button
                        onClick={testConnection}
                        disabled={status === 'testing'}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {status === 'testing' ? 'Testing...' : 'Test Backend Connection'}
                    </button>

                    {message && (
                        <div className={`mt-6 p-4 rounded-lg ${status === 'success' ? 'bg-green-50 border border-green-200' :
                            status === 'error' ? 'bg-red-50 border border-red-200' :
                                'bg-blue-50 border border-blue-200'
                            }`}>
                            <p className={`font-semibold ${status === 'success' ? 'text-green-800' :
                                status === 'error' ? 'text-red-800' :
                                    'text-blue-800'
                                }`}>
                                {message}
                            </p>
                        </div>
                    )}

                    {details && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-2">Response Details:</h3>
                            <pre className="text-sm text-gray-700 overflow-auto">
                                {JSON.stringify(details, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Setup Instructions</h2>

                        <div className="space-y-4 text-sm text-gray-700">
                            <div>
                                <h3 className="font-semibold text-gray-900">1. Backend (.env file is already configured ✅)</h3>
                                <p className="ml-4 text-gray-600">MongoDB connection string has been fixed</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900">2. Frontend (.env.local)</h3>
                                <p className="ml-4 mb-2 text-gray-600">Create a file <code className="bg-gray-100 px-1 rounded">d:\nextjs\frontend\.env.local</code> with:</p>
                                <pre className="ml-4 bg-gray-800 text-green-400 p-3 rounded text-xs overflow-auto">
                                    NEXT_PUBLIC_API_URL=http://localhost:3000
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900">3. Start Backend</h3>
                                <pre className="ml-4 bg-gray-800 text-green-400 p-3 rounded text-xs">
                                    cd d:\nextjs\backend{'\n'}npm run start:dev
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900">4. Start Frontend</h3>
                                <pre className="ml-4 bg-gray-800 text-green-400 p-3 rounded text-xs">
                                    cd d:\nextjs\frontend{'\n'}npm run dev
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
