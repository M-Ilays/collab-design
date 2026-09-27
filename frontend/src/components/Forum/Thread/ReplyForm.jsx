import React, { useState } from "react";
import PrimaryInput from "../../../utils/Inputs/PrimaryInput";
import PrimaryButton from "../../../utils/Buttons/PrimaryButton";

const ReplyForm = ({ commentId, handleReplySubmit }) => {
  const [reply, setReply] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reply.trim() === "") return;
    await handleReplySubmit(reply, commentId);
    setReply(""); // Clear input field immediately after submission
  };

  return (
    <form className="ml-10 mt-2 flex" onSubmit={handleSubmit}>
      <PrimaryInput
        placeHolder="Reply to this comment..."
        value={reply} // Explicitly pass value here
        onChange={(e) => setReply(e.target.value)}
        className={"flex-1 mr-10"}
        name={`reply-${commentId}`} // Unique name per reply field
      />
      <PrimaryButton text="Reply" />
    </form>
  );
};

export default ReplyForm;
