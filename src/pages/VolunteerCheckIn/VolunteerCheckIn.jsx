import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera, CheckCircle2, Clock, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import * as volunteerApi from '../../services/volunteerApi';

function VolunteerCheckIn() {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Slot state
    const [slotData, setSlotData] = useState(null);
    const [hasSlot, setHasSlot] = useState(false);
    const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

    // Camera state
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);

    // Check-in state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkInResult, setCheckInResult] = useState(null);
    const [checkInStatus, setCheckInStatus] = useState(null);

    // Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Fetch today's slot on mount
    useEffect(() => {
        if (token) {
            fetchTodaysSlot();
        }
    }, [token]);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Assign stream when camera step is shown
    useEffect(() => {
        if (showCamera && cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
            videoRef.current.play().catch(e => console.error('Error playing video:', e));
        }
    }, [showCamera, cameraStream]);

    const fetchTodaysSlot = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await volunteerApi.getMyTodaySlot(token);
            setHasSlot(data.hasSlot);
            setAlreadyCheckedIn(data.alreadyCheckedIn || false);
            setSlotData(data.slot || null);
        } catch (err) {
            console.error('Error fetching today\'s slot:', err);
            setError(err.message || 'Failed to load today\'s assignment');
        } finally {
            setIsLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640, max: 1280 },
                    height: { ideal: 480, max: 720 },
                    facingMode: 'user'
                }
            });
            setCameraStream(stream);
            setShowCamera(true);
            setCheckInStatus(null);
        } catch (err) {
            console.error('Error starting camera:', err);
            setCheckInStatus({
                type: 'error',
                message: 'Unable to access camera. Please check permissions and try again.'
            });
        }
    };

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    }, [cameraStream]);

    const handleCapturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsCapturing(true);
        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Wait for video to be ready
            if (video.readyState < 2) {
                await new Promise(resolve => {
                    video.onloadeddata = resolve;
                });
            }

            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            ctx.drawImage(video, 0, 0);

            const photoData = canvas.toDataURL('image/jpeg', 0.8);

            // Validate size
            const base64Data = photoData.split(',')[1];
            const decodedSize = Math.ceil((base64Data.length * 3) / 4);
            const maxSize = 2 * 1024 * 1024;

            if (decodedSize > maxSize) {
                throw new Error('Photo is too large. Please try again.');
            }

            setCapturedPhoto(photoData);
            stopCamera();
        } catch (err) {
            console.error('Error capturing photo:', err);
            setCheckInStatus({
                type: 'error',
                message: err.message || 'Failed to capture photo'
            });
        } finally {
            setIsCapturing(false);
        }
    };

    const handleRetakePhoto = () => {
        setCapturedPhoto(null);
        setCheckInStatus(null);
        startCamera();
    };

    const handleCheckIn = async () => {
        if (!capturedPhoto) {
            setCheckInStatus({
                type: 'error',
                message: 'Please take a photo first.'
            });
            return;
        }

        setIsSubmitting(true);
        setCheckInStatus(null);

        try {
            const result = await volunteerApi.selfCheckIn(capturedPhoto, token);
            setCheckInResult(result);
            setAlreadyCheckedIn(true);
            setCheckInStatus({
                type: 'success',
                message: result.message
            });
        } catch (err) {
            console.error('Error during check-in:', err);
            setCheckInStatus({
                type: 'error',
                message: err.message || 'Check-in failed. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        stopCamera();
        setShowCamera(false);
        setCapturedPhoto(null);
        setCheckInStatus(null);
    };

    // Access check - only volunteers
    if (user?.role !== 'volunteer') {
        return (
            <div className="min-h-screen bg-[#EFEFEF] p-8">
                <div className="max-w-xl mx-auto">
                    <div className="bg-yellow-50 text-yellow-800 px-6 py-8 rounded-lg border border-yellow-200 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                        <h2 className="text-xl font-semibold mb-2">Volunteer Check-In</h2>
                        <p>This page is for volunteers to check in for their assigned class sessions.</p>
                        <p className="mt-2 text-sm">If you are a volunteer, please log in with your volunteer account.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#EFEFEF] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#4242EA]" />
                    <p className="mt-4 text-[#666666]">Loading your assignment...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#EFEFEF] p-8">
                <div className="max-w-xl mx-auto">
                    <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Error</h2>
                        <p>{error}</p>
                        <Button
                            onClick={fetchTodaysSlot}
                            className="mt-4 bg-[#4242EA] hover:bg-[#3535c7]"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // No slot assigned for today
    if (!hasSlot) {
        return (
            <div className="min-h-screen bg-[#EFEFEF] p-8">
                <div className="max-w-xl mx-auto">
                    <div className="bg-white rounded-lg border border-[#C8C8C8] p-8 text-center">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-[#666666]" />
                        <h2 className="text-2xl font-semibold text-[#1E1E1E] mb-2">No Assignment Today</h2>
                        <p className="text-[#666666] mb-4">
                            You don't have a class assignment for today.
                        </p>
                        <p className="text-sm text-[#999999]">
                            If you believe this is an error, please contact staff.
                        </p>
                        <Button
                            onClick={fetchTodaysSlot}
                            variant="outline"
                            className="mt-6 border-[#C8C8C8]"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Already checked in
    if (alreadyCheckedIn && !checkInResult) {
        return (
            <div className="min-h-screen bg-[#EFEFEF] p-8">
                <div className="max-w-xl mx-auto">
                    <div className="bg-green-50 rounded-lg border border-green-200 p-8 text-center">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
                        <h2 className="text-2xl font-semibold text-green-800 mb-2">Already Checked In!</h2>
                        <p className="text-green-700 mb-4">
                            You've already checked in for today's session.
                        </p>
                        {slotData && (
                            <div className="bg-white rounded-lg p-4 mt-4 text-left">
                                <h3 className="font-semibold text-[#1E1E1E] mb-2">{slotData.cohortName}</h3>
                                {slotData.dayNumber && (
                                    <p className="text-sm text-[#666666]">Day {slotData.dayNumber}</p>
                                )}
                                {slotData.dailyGoal && (
                                    <p className="text-sm text-[#666666] mt-1">{slotData.dailyGoal}</p>
                                )}
                                {slotData.checkedInAt && (
                                    <p className="text-xs text-[#999999] mt-2">
                                        Checked in at {new Date(slotData.checkedInAt).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Check-in success celebration
    if (checkInResult) {
        return (
            <div className="min-h-screen bg-[#EFEFEF] p-8">
                <div className="max-w-xl mx-auto">
                    <div className="bg-green-50 rounded-lg border border-green-200 p-8 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
                        <h2 className="text-2xl font-semibold text-green-800 mb-2">
                            {checkInResult.message}
                        </h2>
                        <p className="text-green-700 mb-4">
                            {checkInResult.status}
                        </p>
                        {checkInResult.slot && (
                            <div className="bg-white rounded-lg p-4 mt-4 text-left">
                                <h3 className="font-semibold text-[#1E1E1E] mb-2">
                                    {checkInResult.slot.cohortName}
                                </h3>
                                {checkInResult.slot.dayNumber && (
                                    <p className="text-sm text-[#666666]">
                                        Day {checkInResult.slot.dayNumber}
                                    </p>
                                )}
                                {checkInResult.slot.dailyGoal && (
                                    <p className="text-sm text-[#666666] mt-1">
                                        {checkInResult.slot.dailyGoal}
                                    </p>
                                )}
                            </div>
                        )}
                        <p className="text-sm text-green-600 mt-6">
                            Thank you for volunteering! Have a great session.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Main check-in flow
    return (
        <div className="min-h-screen bg-[#EFEFEF]">
            {/* Header */}
            <div className="border-b border-[#C8C8C8] px-10 py-4">
                <h1
                    className="text-2xl font-normal"
                    style={{
                        background: 'linear-gradient(90deg, #1E1E1E 0%, #4242EA 55.29%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Volunteer Check-In
                </h1>
                <p className="text-[#666666] mt-1">
                    Welcome, {user?.firstName}! Check in for today's session.
                </p>
            </div>

            <div className="p-8 max-w-2xl mx-auto">
                {/* Today's Assignment Card */}
                <div className="bg-white rounded-lg border border-[#C8C8C8] p-6 mb-6">
                    <h2 className="text-lg font-semibold text-[#1E1E1E] mb-4">Today's Assignment</h2>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[#666666] w-24">Cohort:</span>
                            <span className="font-medium text-[#1E1E1E]">{slotData?.cohortName}</span>
                        </div>

                        {slotData?.dayNumber && (
                            <div className="flex items-center gap-2">
                                <span className="text-[#666666] w-24">Day:</span>
                                <span className="font-medium text-[#1E1E1E]">Day {slotData.dayNumber}</span>
                            </div>
                        )}

                        {slotData?.slotType && (
                            <div className="flex items-center gap-2">
                                <span className="text-[#666666] w-24">Type:</span>
                                <span className="font-medium text-[#1E1E1E] capitalize">
                                    {slotData.slotType.replace('_', ' ')}
                                </span>
                            </div>
                        )}

                        {slotData?.dailyGoal && (
                            <div className="mt-4 p-3 bg-[#F5F5F5] rounded-md">
                                <span className="text-sm font-medium text-[#4242EA]">Today's Goal:</span>
                                <p className="text-sm text-[#666666] mt-1">{slotData.dailyGoal}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Check-in Card */}
                <div className="bg-white rounded-lg border border-[#C8C8C8] p-6">
                    <h2 className="text-lg font-semibold text-[#1E1E1E] mb-4 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-[#4242EA]" />
                        Photo Check-In
                    </h2>

                    {/* Status Messages */}
                    {checkInStatus && (
                        <div className={`mb-4 p-3 rounded-md ${
                            checkInStatus.type === 'error'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-green-50 text-green-600 border border-green-200'
                        }`}>
                            {checkInStatus.message}
                        </div>
                    )}

                    {/* Initial state - Start Camera button */}
                    {!showCamera && !capturedPhoto && (
                        <div className="text-center py-8">
                            <Camera className="w-16 h-16 mx-auto mb-4 text-[#C8C8C8]" />
                            <p className="text-[#666666] mb-4">
                                Take a photo to check in for today's session.
                            </p>
                            <Button
                                onClick={startCamera}
                                className="bg-[#4242EA] hover:bg-[#3535c7]"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Start Camera
                            </Button>
                        </div>
                    )}

                    {/* Camera view */}
                    {showCamera && !capturedPhoto && (
                        <div className="space-y-4">
                            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={handleCapturePhoto}
                                    disabled={isCapturing || !cameraStream}
                                    className="bg-[#4242EA] hover:bg-[#3535c7]"
                                >
                                    {isCapturing ? 'Capturing...' : 'Take Photo'}
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="border-[#C8C8C8]"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Photo preview and confirm */}
                    {capturedPhoto && (
                        <div className="space-y-4">
                            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                <img
                                    src={capturedPhoto}
                                    alt="Captured"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={handleCheckIn}
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? 'Checking in...' : 'Complete Check-In'}
                                </Button>
                                <Button
                                    onClick={handleRetakePhoto}
                                    disabled={isSubmitting}
                                    variant="outline"
                                    className="border-[#C8C8C8]"
                                >
                                    Retake Photo
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VolunteerCheckIn;
