//import StatCard from "./StatCard";
import StatCard from "./StatCard";
import train from "../../assets/Cards/train.svg";
import pisa from "../../assets/Cards/pisa.svg";
import library from "../../assets/Cards/library.svg";
import tower from "../../assets/Cards/tower.svg";

const StatContainer = ({ stats }) => {
  const statData = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      color: "bg-blue-500",
      bgImage: tower,
    },
    {
      title: "Completed Projects",
      value: stats.completedProjects,
      color: "bg-orange-500",
      bgImage: train,
    },
    {
      title: "Ongoing Projects",
      value: stats.ongoingProjects,
      color: "bg-green-500",
      bgImage: pisa,
    },
    {
      title: "Shared Projects",
      value: stats.sharedProjects,
      color: "bg-yellow-500",
      bgImage: library,
    },
  ];

  return (
    <div className="hidden xl:flex justify-between my-5 px-4 sm:px-20 gap-4 w-full">
      {statData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          bgImage={stat.bgImage}
          colour={stat.color}
        />
      ))}
    </div>
  );
};

export default StatContainer;
