import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/features/api/lectureApi";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Lecture from "./Lecture";
import axios from "axios";

const MEDIA_API = "http://localhost:8080/api/v1/media";

const CreateLecture = () => {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [isPreviewFree, setIsPreviewFree] = useState(false);

  const [lectureTitle, setLectureTitle] = useState("");
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  const [createLecture, { data, isLoading, isSuccess, error }] =
    useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery(courseId);

  const fileChangeHandler = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = res.data?.data;

      if (!result?.secure_url) {
        throw new Error("secure_url missing from response");
      }

      setVideoUrl(result.secure_url);
      setPublicId(result.public_id);

      toast.success("Video uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };
  // console.log(lectureTitle, "titie");
  // console.log(videoUrl, "dfiv");

  const createLectureHandler = async () => {
    // console.log(videoUrl, "dfiafjad;klfv");
    try {
      await createLecture({
        lectureTitle,
        videoUrl,
        publicId,
        isPreviewFree,
        courseId,
      }).unwrap(); 

      setLectureTitle("");
      setVideoUrl("");
      setPublicId("");
      setIsPreviewFree(false);
    } catch (err) {
      console.error("Failed to create lecture:", err);
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  // console.log(lectureData);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Let's add lectures, add some basic details for your new lecture
        </h1>
        <p className="text-sm">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus,
          laborum!
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Lecture Title</Label>
          <Input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Your Title Name"
          />
        </div>
        <div>
          <Label>Upload Video Lecture</Label>
          <Input type="file" accept="video/*" onChange={fileChangeHandler} />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="preview"
            type="checkbox"
            checked={isPreviewFree}
            onChange={(e) => setIsPreviewFree(e.target.checked)}
          />
          <Label htmlFor="preview">Mark as Free Preview</Label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}`)}
          >
            Back to course
          </Button>
          <Button disabled={isLoading || uploading || !videoUrl} onClick={createLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create lecture"
            )}
          </Button>
        </div>
        <div className="mt-10">
          {lectureLoading ? (
            <p>Loading lectures...</p>
          ) : lectureError ? (
            <p>Failed to load lectures.</p>
          ) : lectureData.lectures.length === 0 ? (
            <p>No lectures availabe</p>
          ) : (
            lectureData?.lectures?.map((lecture, index) => (
              <Lecture
                key={lecture._id}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
