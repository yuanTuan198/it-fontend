import React from "react";
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskHub" },
    { name: "description", content: "Welcome to TaskHub!" },
  ];
}

const Homepage = () => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">IT PRS</h1>
        <p className="text-gray-500">Manage your tasks effortlessly.</p>
        <div className="flex flex-col gap-4">
          <Link to="/sign-in">
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 text-lg py-6 rounded-xl">
              Login
            </Button>
          </Link>
          <Link to="/sign-up">
            <Button
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 text-lg py-6 rounded-xl"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
