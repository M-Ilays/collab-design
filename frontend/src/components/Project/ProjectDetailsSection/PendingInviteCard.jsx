import { IoTrashOutline } from "react-icons/io5";

const PendingInviteCard = ({
  email,
  invitedAt,
  onCancel,
  canCancel,
  isLast,
}) => {
  return (
    <div
      className={`flex items-center justify-between p-4 ${
        !isLast && "border-b border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-300">
              {email.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {email}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Invited on {invitedAt}
          </p>
        </div>
      </div>
      {canCancel && (
        <div>
          <button
            onClick={onCancel}
            className="hidden md:block border-2 cursor-pointer rounded-md px-4 py-2 border-[#dc2626] text-[#dc2626] hover:text-red-800 hover:border-red-800 transition-colors duration-300"
          >
            <h3 className="text-base"> Cancel Invite</h3>
          </button>
          <IoTrashOutline
            onClick={onCancel}
            className={"block md:hidden"}
            size={24}
            color="#dc2626"
          />
        </div>
      )}
    </div>
  );
};

export default PendingInviteCard;
