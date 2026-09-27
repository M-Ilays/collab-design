import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
const Back = () => {
  const navigate = useNavigate();
  return (
    <IoMdArrowRoundBack
      onClick={() => navigate(-1)}
      size={24}
      className="text-neutral-800 dark:text-white cursor-pointer"
    />
  );
};

export default Back;
