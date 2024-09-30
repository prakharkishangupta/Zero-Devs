import React from "react";
import Lottie from "lottie-react";
import logo from "@/assets/home.json";
import Shade from "@/assets/shade.svg?react";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <main className="h-full">
      <section className="bg-[#163F52] h-screen flex justify-between">
        <div className="w-2/3 flex flex-col text-white font-thin p-10 items-center">
          <div className="m-16">
            <h1 className="text-6xl">Do eKYC</h1>
            <h1 className="text-6xl">Hassle-Free</h1>
            <h1 className="text-6xl">Using mKYC</h1>
            <p className="mt-10 text-xl font-thin">
              An AI-based eKYC application leverages artificial intelligence to
              streamline the Know Your Customer process by automating identity
              verification through secure video calls. It uses facial
              recognition and document validation to ensure compliance and
              reduce human intervention. This approach enhances both security
              and user experience.
            </p>
            <Button className="my-10 py-8 px-10 text-2xl font-thin bg-yellow-500 hover:bg-yellow-600 text-white">
              <a href="/auth/signup">Get Started</a>
            </Button>
          </div>
        </div>
        <div className="relative">
          <Shade className="absolute top-0 w-full h-full" />
          <Lottie animationData={logo} />
        </div>
      </section>
    </main>
  );
};

export default Home;
