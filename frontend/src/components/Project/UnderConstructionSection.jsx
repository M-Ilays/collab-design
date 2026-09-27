import { MdConstruction } from "react-icons/md";

const UnderConstructionSection = () => {
  return (
    <section className=" rounded-md bg-white text-black  dark:bg-dark   ">
      <div className="flex  flex-col py-20 items-center justify-center">
        <MdConstruction size={80} color={"#5a3783"} />
        <h1 className="text-lg sm:text-2xl text-neutral-600 dark:text-white font-medium">
          Currently under construction
        </h1>
      </div>
    </section>
  );
};

export default UnderConstructionSection;
