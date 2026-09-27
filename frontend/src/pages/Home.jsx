import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../components/Home/HomeHeader.jsx";
import Hero from "../components/Home/Hero.jsx";
import Features from "../components/Home/Feature/Features.jsx";
import Accordian from "../components/Home/Accordian/Accordian.jsx";
import TrySection from "../components/Home/Try-Forum/TrySection.jsx";
import Footer from "../components/Home/Footer.jsx";
import Auth from "../components/Authentication/Auth.jsx";
import Message from "../overlays/Message.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import getUser from "../getUser.js";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isModalOpen]);

  useEffect(() => {
    const checkTokenAndSetUser = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token =
        urlParams.get("token") || localStorage.getItem("collabToken");

      if (token) {
        localStorage.setItem("collabToken", token);
        setUser({ token });
        navigate("/dashboard");
      }
    };

    checkTokenAndSetUser();
  }, [setUser, navigate]);

  return (
    <div className="bg-white">
      {/* Modal rendering */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-20 "
          onClick={toggleModal}
        >
          <div className="relative">
            <Auth stopPropagation={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {verificationMessage && (
        <Message
          text={verificationMessage}
          onClose={() => {
            setVerificationMessage("");
          }}
        />
      )}

      <HomeHeader toggleModal={toggleModal} />
      <Hero toggleModal={toggleModal} />
      <Features />
      <Accordian />
      <TrySection />
      <Footer />
    </div>
  );
};

export default Home;
