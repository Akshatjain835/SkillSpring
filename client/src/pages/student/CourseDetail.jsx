import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeInfo } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PlayCircle } from "lucide-react";
import { Lock } from "lucide-react";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";


const course=[1,2,3,4,5,6,7,8,9,10]

const CourseDetail = () => {
    
   const purchased=true
  
    return (
      <div className="space-y-5">
        <div className="bg-[#2D2F31] text-white">
          <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
            <h1 className="font-bold text-2xl md:text-3xl">
               Course Title
            </h1>
            <p className="text-base md:text-lg">Course Sub-title</p>
            <p>
              Created By{" "}
              <span className="text-[#C0C4FC] underline italic">
                Creator Name
              </span>
            </p>
            <div className="flex items-center gap-2 text-sm">
              <BadgeInfo size={16} />
              <p>Last updated 2025-07-13</p>
            </div>
            <p>Students enrolled: 100</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
          <div className="w-full lg:w-1/2 space-y-5">
            <h1 className="font-bold text-xl md:text-2xl">Description</h1>
            <p
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: "Course Description" }}
            />
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>4 lectures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.map((lecture, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <span>
                      {true ? <PlayCircle size={14} /> : <Lock size={14} />}
                    </span>
                    <p>Lecture Title</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="w-full lg:w-1/3">
            <Card>
              <CardContent className="p-4 flex flex-col">
                <div className="w-full aspect-video mb-4">
                  <ReactPlayer
                    width="100%"
                    height={"100%"}
                    url={""}
                    controls={true}
                  />
                </div>
                <h1>Lecture title</h1>
                <Separator className="my-2" />
                <h1 className="text-lg md:text-xl font-semibold">Course Price</h1>
              </CardContent>
              <CardFooter className="flex justify-center p-4">
                {
                    purchased ? <Button>Continue Course</Button> : <Button>Buy Course</Button>
                }
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  };
  
  export default CourseDetail;