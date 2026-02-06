import List from '../list/List'
import Chat from '../chat/Chat'
import NoChat from '../noChat/noChat'; 
import Details from '../details/Details'
import { useChatState } from '../../lib/useChatState';
export default function Layout() {
    const { chatId } = useChatState();
    if (!chatId) {
        return <>
            <List />
            <NoChat />
        </>
    }
    return (
        <>
            <List />
            <Chat />
            <Details />
        </>
    )
}
