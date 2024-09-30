import { useState, useEffect, useRef, EventHandler } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw } from "lucide-react";
import useApiSender from "@/setup/hooks/api/useApiSender";
import { uploadForm } from "@/webApi/uploadForm";
import Loader from "@/assets/spinner.svg?react";
import { useNavigate } from 'react-router-dom';

interface FormDataState {
  video: any;
  govId: File | null;
  photograph: File | null;
}

const steps = [
  { id: 1, title: "Upload Government ID" },
  { id: 2, title: "Record 5-Second Video" },
  { id: 3, title: "Upload Photograph" },
  { id: 4, title: "Loading" },
  { id: 5, title: "Result" },
];

const RECORDING_DURATION = 5; // in seconds

export default function Upload() {
  const { send, status, isLoading, data } = useApiSender(uploadForm, true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataState>({
    govId: null,
    video: null,
    photograph: null,
  });
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Load data from local storage on component mount
    const storedData = localStorage.getItem("kycData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(parsedData);
      if (parsedData.video) {
        setVideoUrl(
          URL.createObjectURL(
            new Blob([parsedData.video], { type: "video/webm" })
          )
        );
      }
    }
  }, []);

  useEffect(() => {
    // Save data to local storage whenever formData changes
    localStorage.setItem("kycData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= RECORDING_DURATION) {
            stopRecording();
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleFileChange = (event: any, field: string) => {
    const file = event.target.files[0];
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const navigate = useNavigate();
  const handleSubmit = async () => {
    // Simulate API post request
    
    setTimeout(() => {
      // Redirect to the result page
      navigate('/Result'); // Assuming your Result page is at '/result'
    }, 2000);
    // console.log("Submitting data:", formData);
    // const form = new FormData();
    // form.append("govId", formData.govId || "");
    // form.append("video", formData.video);
    // form.append("photograph", formData.photograph || "");

    // try {
    //   await send({ form });
    //   // Clear local storage and reset form
    //   localStorage.removeItem("kycData");
    //   setFormData({ govId: null, video: null, photograph: null });

    //   setVideoUrl(null);
    //   setCurrentStep((prev) => prev + 1);
    //   alert("KYC data submitted successfully!");
    // } catch (error) {
    //   console.log("something went wrong during upload", error);
    //   setCurrentStep(1);
    // }
  };

  const startRecording = async () => {
    console.log("start");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current == null) return;
      videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setFormData((prev) => ({ ...prev, video: blob }));
        setVideoUrl(URL.createObjectURL(blob));
        chunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopRecording = () => {
    console.log("stop");
    if (
      videoRef.current &&
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      videoRef.current.srcObject &&
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      setIsRecording(false);
      videoRef.current.srcObject = null; // Clear the live stream
    }
  };

  const playRecordedVideo = () => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
      videoRef.current.play();
    }
  };

  const reRecord = () => {
    setVideoUrl(null);
    setFormData((prev) => ({ ...prev, video: null }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            KYC Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={(currentStep / steps.length) * 100}
            className="mb-4"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{steps[0].title}</h3>
                  <Label htmlFor="govId">Upload Government ID</Label>
                  <Input
                    id="govId"
                    type="file"
                    onChange={(e) => handleFileChange(e, "govId")}
                    accept="image/*"
                  />
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{steps[1].title}</h3>
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                      src={videoUrl || undefined}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    {!videoUrl ? (
                      <Button onClick={startRecording} disabled={isRecording}>
                        {isRecording ? "Recording..." : "Start Recording"}
                      </Button>
                    ) : (
                      <div className="flex justify-between w-full items-center">
                        <Button onClick={playRecordedVideo}>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                        <Button onClick={reRecord} variant="outline">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Re-record
                        </Button>
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {isRecording
                        ? `${recordingTime}/${RECORDING_DURATION}s`
                        : ""}
                    </span>
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{steps[2].title}</h3>
                  <Label htmlFor="photograph">Upload Photograph</Label>
                  <Input
                    id="photograph"
                    type="file"
                    onChange={(e) => handleFileChange(e, "photograph")}
                    accept="image/*"
                  />
                </div>
              )}
              {currentStep === 4 && (
                <div className="flex justify-center items-center h-20 gap-5">
                  <Loader />
                  <div>Processing Image Matching & Liveness Detection</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep < 4 ? (
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isRecording}
            >
              Previous
            </Button>
          ) : (
            <div></div>
          )}
          {currentStep < 3 ? (
            <Button onClick={handleNextStep} disabled={isRecording}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Submit</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
