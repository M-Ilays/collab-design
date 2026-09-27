import ProjectHeader from "../components/Project/ProjectHeader";
import { useLocation, useParams } from "react-router-dom";
import React, { lazy, Suspense, useState } from "react";
import { use } from "react";

const Canvas = lazy(() => import("../components/Canvas/Canvas"));

const DiagramCanvas = () => {
  const location = useLocation();
  const databaseDiagrams = location.state?.diagrams || [];
  const projectName = location.state?.projectName || "";
  const projectStatus = location.state?.projectStatus || "";
  const params = useParams();
  const activeVersionId = params.versionId;
  console.log("versionId", activeVersionId);
  return (
    <div className="dark:bg-dark-900 h-screen flex flex-col">
      <ProjectHeader projectName={projectName} projectStatus={projectStatus} />

      <div className="flex-1">
        <Suspense fallback={<div>Loading editor...</div>}>
          <Canvas versionId={activeVersionId} />
        </Suspense>
      </div>
    </div>
  );
};

export default DiagramCanvas;
