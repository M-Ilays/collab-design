import { useNavigate } from "react-router-dom";
import TryCard from "./TryCard.jsx";

const TrySection = () => {
  const navigate = useNavigate();
  return (
    <section
      id="Try"
      className="flex flex-col md:flex-row justify-center items-center gap-6 p-6 mt-10 mx-auto"
    >
      {/* <TryCard
                title="Try Collab Design"
                description="Experience the power of collaborative design and requirements management."
                buttonLabel="Launch Demo App"
                buttonAction = {()=>{}}
            /> */}
      <TryCard
        title="Join the Community"
        description="Connect with other users, share ideas, and get support in our discussion forum."
        buttonLabel="Visit Forum"
        buttonAction={() => {
          navigate("/forum");
        }}
      />
    </section>
  );
};

export default TrySection;
