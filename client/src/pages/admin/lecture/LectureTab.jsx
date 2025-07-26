import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
  useEditLectureMutation,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "@/features/api/lectureApi";
import { useNavigate, useParams } from "react-router-dom";

const MEDIA_API = `${import.meta.env.VITE_API_URL}/api/v1/media`;

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [isFree, setIsFree] = useState(false);

  const [btnDisable, setBtnDisable] = useState(true);

  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const params = useParams();
  const { courseId, lectureId } = params;

  const navigate = useNavigate();

  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo(lecture.videoInfo);
    }
  }, [lecture]);

  const [edtiLecture, { data, isLoading, error, isSuccess }] =
    useEditLectureMutation();

  const [
    removeLecture,
    { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess },
  ] = useRemoveLectureMutation();

  const fileChangeHandler = async (e) => {
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);

      const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const result = res.data?.data;
      if (!result?.secure_url) {
        throw new Error("secure_url missing from response");
      }
      setUploadVideoInfo({
        videoUrl: result.secure_url,
        publicId: result.public_id,
      });
      toast.success("Video edited successfully");
    } catch (error) {
      toast.error("Failed to upload video");
    } finally {
      setMediaProgress(false);
    }
  };
  // console.log(uploadVideoInfo, "fdaf");

  const editLectureHandler = async () => {
    
    try {
      await edtiLecture({
        lectureTitle,
        videoUrl: uploadVideoInfo?.videoUrl,
        publicId: uploadVideoInfo?.publicId,
        isPreviewFree: isFree,
        courseId,
        lectureId,
      }).unwrap();
    } catch (err) {
      console.error("Failed to edit lecture:", err);
      toast.error(err?.data?.message || "Something went wrong in editing");
    }
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
      navigate(`/admin/course/${courseId}/lecture`);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message);
    }
  }, [removeSuccess]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={removeLoading}
            variant="destructive"
            onClick={removeLectureHandler}
          >
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        <div className="my-5">
          <Label>
            Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            placeholder="Ex. Introduction to Javascript"
            className="w-fit"
          />
        </div>
        <div className="flex items-center space-x-2 my-5">
          <Switch
            checked={isFree}
            onCheckedChange={setIsFree}
            id="airplane-mode"
          />
          <Label htmlFor="airplane-mode">Is this video FREE</Label>
        </div>


        <div className="mt-4">
          <Button
            disabled={isLoading || !uploadVideoInfo?.videoUrl}
            onClick={editLectureHandler}
          >
            {isLoading  ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Update Lecture"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
