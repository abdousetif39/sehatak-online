import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FloatingBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(true);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (location.pathname === "/") return null;

  return (
    <button
      onClick={() => {
        setRipple(true);
        navigate(-1);
        setTimeout(() => setRipple(false), 400);
      }}
      className={`
      fixed
      bottom-5
      left-5
      md:top-5
      md:left-5
      md:bottom-auto
      z-50
      w-14
      h-14
      rounded-full
      bg-gradient-to-r
      from-blue-600
      to-cyan-500
      text-white
      shadow-2xl
      transition-all
      duration-300
      hover:scale-110
      hover:shadow-cyan-300/40
      active:scale-95
      flex
      items-center
      justify-center
      overflow-hidden
      ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      }
    `}
    >
      {ripple && (
        <span className="absolute w-full h-full rounded-full bg-white/30 animate-ping"></span>
      )}

      <ArrowLeft
        className={`w-7 h-7 ${
          i18n.language === "ar" ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}