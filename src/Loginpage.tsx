import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { Wallet, ShieldCheck, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import freighter from '@stellar/freighter-api';

// 3D Animated Background Element
const BackgroundShape = () => (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1, 100, 200]} scale={2.5}>
            <MeshDistortMaterial
                color="#2d37ed"
                attach="material"
                distort={0.4}
                speed={1.5}
                roughness={0.2}
            />
        </Sphere>
    </Float>
);

interface LoginPageProps {
    onLogin: (publicKey: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const connectFreighter = async () => {
        setError(null);
        setLoading(true);

        try {
            // Step 1: Check if Freighter is installed
            let isFreighterInstalled = false;
            try {
                const connResult = await freighter.isConnected();
                isFreighterInstalled = typeof connResult === 'object' ? !!(connResult as any).isConnected : !!connResult;
            } catch {
                isFreighterInstalled = false;
            }

            if (!isFreighterInstalled) {
                setError('Freighter wallet not found. Please install the Freighter browser extension.');
                setLoading(false);
                return;
            }

            // Step 2: Request access — triggers Freighter popup for user approval
            const accessResult = await freighter.requestAccess();
            const address = (accessResult as any).address || (typeof accessResult === 'string' ? accessResult : '');

            // Step 3: Validate public key
            if (!address || address.length === 0) {
                throw new Error('Could not retrieve public key. Make sure Freighter is unlocked and you have an account.');
            }

            // Step 4: Login successful
            onLogin(address);
        } catch (err: any) {
            console.error('Freighter connection error:', err);
            setError(err.message || 'Failed to connect wallet. Is Freighter unlocked?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0b14] overflow-hidden flex items-center justify-center font-sans text-slate-200">

            {/* Three.js Canvas for 3D depth */}
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Suspense fallback={null}>
                        <BackgroundShape />
                    </Suspense>
                </Canvas>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 mx-4 transition-all border border-white/10 shadow-2xl rounded-3xl bg-white/5 backdrop-blur-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 mb-4 rounded-2xl bg-indigo-600/20 ring-1 ring-indigo-500/50">
                        <Wallet className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Stellar Pay</h1>
                    <p className="mt-2 text-sm text-slate-400">Connect your Freighter wallet to start transacting</p>
                </div>

                <div className="space-y-5">
                    {/* Freighter Info */}
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <div className="flex items-center gap-3 mb-2">
                            <img
                                src="https://stellar.org/img/ecosystem/freighter.png"
                                alt="Freighter"
                                className="w-6 h-6 rounded"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span className="text-sm font-semibold text-white">Freighter Wallet</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Freighter is a Stellar wallet browser extension. Make sure it's installed, unlocked, and set to <span className="text-indigo-400 font-medium">Testnet</span>.
                        </p>
                        <a
                            href="https://www.freighter.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Get Freighter <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 text-sm rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={connectFreighter}
                        disabled={loading}
                        className="flex items-center justify-center w-full gap-2 px-4 py-3.5 font-bold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Wallet className="w-5 h-5" />
                                Connect Freighter Wallet
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>Secure Testnet Node</span>
                        </div>
                        <span className="px-2 py-1 rounded bg-white/5">v2.4.0</span>
                    </div>
                </div>
            </div>

            {/* Decorative Blur Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full" />
        </div>
    );
};

export default LoginPage;
