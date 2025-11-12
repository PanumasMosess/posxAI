import SigninForm from "@/components/forms/SigninForm";
import SearchHandler from "@/components/SearchHandler";
import Image from "next/image";
import { Suspense } from "react";

const Home = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchHandler />
      <div className="w-full lg:grid min-h-screen lg:grid-cols-2 xl:grid-cols-5">
        <div className="relative hidden bg-muted lg:flex items-center justify-center xl:col-span-2">
          <Image
            src="https://wallpapercave.com/wp/wp8284081.jpg"
            alt="Background Image"
            fill
            className="object-cover opacity-20 dark:opacity-40"
            priority
          />
          <div className="relative z-10 flex flex-col  justify-start gap-8 h-full p-12 text-white">
            <a href="/" title="POSX">
              <img
                src="https://app.posx.co/img/POSX_2.png"
                alt="Logo"
                className="h-15"
              />
            </a>
            <div>
              <h1 className="text-4xl font-light leading-snug">
                <span className="font-medium">ยินดีต้อนรับสู่</span>{" "}
                ระบบผู้ช่วยร้านอาหาร Online
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 xl:col-span-3 bg-background">
          <SigninForm />
        </div>
      </div>
    </Suspense>
  );
};

export default Home;
