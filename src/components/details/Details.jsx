import { toast } from 'react-toastify';
import style from './Details.module.scss';
import { useChatState } from '../../lib/useChatState';
export default function Details() {
  const { user, changeBlockStatus, isReceiverBlocked } = useChatState();
  const images = [
    "/HD-wallpaper-whatsapp.jpg",
    "/HD-wallpaper-whatsapp.jpg",
    "/HD-wallpaper-whatsapp.jpg",
    "/HD-wallpaper-whatsapp.jpg",
    "/HD-wallpaper-whatsapp.jpg",
    "/HD-wallpaper-whatsapp.jpg",
    "/HD-wallpaper-whatsapp.jpg"
  ];
  const handelBlock = async () => {
    try {
      await changeBlockStatus();
      toast.success(isReceiverBlocked ? "User unblocked successfully" : "User blocked successfully");
    } catch (error) {
      toast.error("Failed to change block status");
    }
  }
  return (
    <section className={style.detailsSec}>
      <div className={style.userDetails}>
        <img src={user?.avatar || "/avatar.png"} alt="chat image" />
        <p>{user?.username || "Unknown User"}</p>
      </div>

      <hr />

      <div className={style.chatMedia}>
        <p>Media</p>
        <div className={style.scrollContainer}  >

          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`media-${i}`}
            />
          ))}
        </div>
      </div>
      <div className={style.chatSettings}>
        <p>Chat Settings</p>
        <div className={style.setting}>
          <img src="/arrowDown.png" alt=" " />
        </div>
      </div>
      <div className={style.sharedFiles}>
        <p>Shared files</p>
        <div className={style.setting}>
          <img src="/arrowDown.png" alt=" " />
        </div>
      </div>
      <button className={style.block} onClick={handelBlock}>{isReceiverBlocked ? "Unblock" : "Block"} {user?.username}</button>
    </section>
  );
}
