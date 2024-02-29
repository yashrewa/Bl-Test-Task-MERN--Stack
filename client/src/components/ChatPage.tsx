/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import * as io from 'socket.io-client'
import { useNavigate } from 'react-router-dom';
import { expressBackend, socketBakcend } from './Utils/backendLink';

interface CustomSocket extends io.Socket {
    userId?: string;
}

interface Message {
    user: any;
    message: string;
}

interface MessagesState {
    data: Message[];
    conversationId: string | null;
    receiverId: string | null;
}
interface User {
    email: string;
    fullName: string;
    userId: string;
    user: User;
}


interface Data {
    conversationId: string;
    user?: [User] | {
        email: string;
        fullName: string;
    };
    email: string;
}
interface Conversations {
    data: [Data];
    user: User;
}

interface Users {
    userId: string;
    data: [User],
    
}


function ChatPage() {
    const navigate = useNavigate()
    const [conversations, setConversations] = useState<Conversations| null>(null);
    const [senderId] = useState(localStorage.getItem('userId'))
    const [messages, setMessages] = useState<MessagesState>({ data: [], conversationId: null, receiverId: null });
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState<Users | undefined>(undefined)
    const [socket, setSocket] = useState<CustomSocket | null>(null)
    const messageRef = useRef<HTMLDivElement | null>(null)




    useEffect(() => {
        const newSocket: CustomSocket = io.connect(socketBakcend) as CustomSocket
        setSocket(newSocket)
    }, [])

    useEffect(() => {
        socket?.emit('addUser', localStorage.getItem('userId'))
        // socket?.on('getUser', user => {
        //     console.log('ACTIVE USERS', user);
        // })

        // console.log("from useEFFECT of socket", messages);
        socket?.on('getMessage', newData => {
            // console.log('DATA FROM SOCKET =>', newData)
            setMessages({ ...messages, data: [...messages.data, { user: newData.user, message: newData.message }] })
        })

        // socket?.on('updatedConversation',data=>{
        //     setConversations([...conversations, ...data])
        // })
        console.log(messages);


    }, [socket, messages, message])

    console.log('USERS', users);
    useEffect(() => {
        messageRef?.current?.scrollIntoView({ behavior: 'smooth' })

        // console.log('conversations',conversations)
        // console.log("MESSAGES STATE AFTER GETTING MSG RESPONSE FROM SOCKET", messages)
    }, [messages?.data])


    useEffect(() => {
        fetchConversations()
        fetchUsers()
    }, [])


    const fetchUsers = async () => {
        try {
            if (localStorage.getItem('token') !== null) {
                const response: any = await axios.get(`${expressBackend}/api/users/${localStorage.getItem('userId')}`, {
                    headers: {
                        authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                })
                setUsers(response)
            } else {
                window.alert('Login Required')
                navigate('/')
            }
        } catch (error) {
            console.log(error);
            navigate('/')

        }
    }

    const fetchConversations = async () => {
        const response: any = await axios.get(`${expressBackend}/api/conversations/${localStorage.getItem('userId')}`, {})
        setConversations(response)
    }

    const fetchMessages = async (convoId: string, userData: any) => {
        // console.log("DATA sent from Fetch Messages", userData);
        // console.log("ALL USERS ARRAY", users)


        const response = await axios.get(`${expressBackend}/api/message/${convoId}?senderId=${localStorage.getItem('userId')}&receiverId=${userData?.userId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        // console.log("RESPONSE FROM FETCHED MESSAGES=>", response)

        setMessages({ data: response?.data?.messageUserData, conversationId: response?.data?.conversationId, receiverId: userData?.userId })
        // console.log("RESPONSE AFTER ELSE", response)


        // console.log("FINAL MESSAGES ARRAY AFTER IF ELSE",messages)
    }


    const receiver = messages?.data?.find(message => message.user.id !== localStorage.getItem('userId'))



    const sendMessage = async () => {

        socket?.emit('sendMessage', {
            conversationId: messages?.conversationId,
            senderId: localStorage.getItem('userId'),
            message: message,
            receiverId: messages?.receiverId
        })

        // socket?.emit('addConversation',{

        // })

        const response = await axios.post(`${expressBackend}/api/message`, {
            conversationId: messages?.conversationId,
            senderId: localStorage.getItem('userId'),
            message: message,
            receiverId: messages?.receiverId,
        })

        const updatedConversation: any = await axios.get(`${expressBackend}/api/conversations/${localStorage.getItem('userId')}`, {})

        console.log('conversations updated after sending message', updatedConversation);

        setConversations(updatedConversation)
        // const Receiver = updatedConversation?.data?.filter(member => member?.user?.userId === messages?.receiverId)
        // socket?.emit('updatedConversation', {
        //     updatedConversation,
        //     ReceiverId: Receiver
        // })

        setMessage('')
        console.log("RESPONSE AFTER SENDING MESSAGE", response)
    }




    return (
        <div className='bg-base-200 h-auto justify-items-center'>
            <div className="drawer pb-2 sticky top-0 z-20">
                <input id="my-drawer" type="checkbox" className="drawer-toggle " />
                <div className="drawer-content">
                    <div className="navbar bg-base-100 shadow-lg  shadow-base-300 -mb-0">
                        <div className="flex-none">
                            <label htmlFor='my-drawer' className="btn btn-square btn-ghost drawer-open drawer-button">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block  w-7 h-7 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            </label>
                        </div>
                        <div className="flex-auto  justify-normal">
                            <span className="btn btn-ghost text-xl lg:text-4xl"> ← CONVERSATIONS</span>
                        </div>
                        <div className='text-2xl font-bold cursor-pointer' onClick={() => {
                            localStorage.clear();
                            navigate('/')
                        }}>
                            <svg width="32px" height="32px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="font-bold">
                                <path d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 0 1-112.7 75.9A352.8 352.8 0 0 1 512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 0 1-112.7-75.9 353.28 353.28 0 0 1-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 7.9 7.9 15.3 16.1 22.4 24.5 3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82 271.7 82.6 79.6 277.1 82 516.4 84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7 3.4-5.3-.4-12.3-6.7-12.3zm88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6z" />
                            </svg>
                            <span className='pl-2 hidden lg:block'>Logout</span>
                        </div>
                    </div>
                </div>
                <div className="drawer-side">
                    <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                    <ul className="menu text-xl  p-4 w-80 min-h-full justify-start bg-base-200 text-base-content">
                        <div className='h-32 lg:text-center top-0 left-0 md:block w-72 text-xl lg:text-3xl font-semibold mb-4 bg-base-200'>Current User - <span className='font-extrabold'>{localStorage.getItem('userName')}</span></div>
                        {/* Sidebar content here */}
                        <div className='text-xl font-semibold'>Messages:</div>
                        {conversations && conversations?.data?.map(({ conversationId, user }) => {
                            return (
                                <li key={conversationId} onClick={() => fetchMessages(conversationId, user)} className='bg-base-content rounded-5xl hover:rounded-xl text-base-100 hover:bg-base-content my-2 '><span className='pt-4  bg-base-content hover:bg-base-content'>{Array.isArray(user) ? user[0]?.fullName : user?.fullName}</span>
                                    <div className='text-xs bg-base-content hover:bg-base-content -mt-2 text-base-100 '> {Array.isArray(user) ? user[0]?.email : user?.email}</div>
                                </li>
                            )
                        })}
                        <div className='text-xl font-semibold'>All Users:</div>

                        {users?.data?.map((user) => {
                            return (
                                <li key={user.userId} onClick={() => fetchMessages('new', user)} className=' bg-base-300 rounded-xl hover:bg-base-300 my-2 '><span className='pt-4 bg-base-300 hover:bg-base-300'>{user?.user?.fullName}</span>
                                    <div className='text-xs hover:bg-base-300 -mt-2 text-gray-700'> {user?.user?.email}</div>
                                </li>
                            )
                        })}

                    </ul>
                </div>
            </div>
            {/* Above is the sidebar */}

            {/* <SuccessAlert message={'Welcome to the broadcast channel'} /> */}
            {/* {newUserJoined && <NormalAlert message={`${newUserJoined}`} />} */}
            {/* <div className='leading-loose  text-2xl  flex text-black justify-center lg:pl-4 lg:justify-start bg-gray-100 w-screen'></div> */}
            <div className='justify-center h-screen  mx-auto max-w-6xl w-11/12 lg:w-8/12 overflow-y-scroll lg:px-4 '>
                {receiver?.user?.fullName && <div className='text-center text-xl lg:text-3xl bg-base-content text-base-100 py-4 my-2 mx-0 lg:py-6 lg:w-4/12 rounded-lg lg:mx-auto '>{receiver?.user?.fullName}</div>}
                {messages?.data?.length > 0 ? messages?.data?.map(message => {
                    return (
                        <>
                            <div ref={messageRef} key={message?.user?.id}>
                                <div className={`chat chat-start ${message?.user?.id === senderId && 'chat-end'}`}>
                                    <div className="chat-image avatar">
                                        <div className="w-10 rounded-full">
                                            <img alt="Tailwind CSS chat bubble component" src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                                        </div>
                                    </div>
                                    <div className="chat-header">
                                        {message.user.fullName.split(' ')[0]}
                                    </div>
                                    <div className="chat-bubble">{message.message}</div>
                                    <div className="chat-footer opacity-50">
                                        Delivered
                                    </div>
                                </div>
                            </div>
                        </>
                    )

                }) : <div className='mt-4 h-screen font-semibold text-center text-4xl'>No Conversation Selected or No New Message<div className='pt-4 text-red-500'>BUG:</div><div className='text-2xl text-red-500'> After sending message to the new user go to their conversation from side panel</div></div>}


            </div>
            {messages?.receiverId && (
                <div className='sticky bg-base-200 bottom-0 left-0 right-0'>
                    <div className="flex items-center px-3 py-2 md:mx-12 rounded-xl bg-gray-100">
                        <textarea id="chat"
                            value={message}
                            rows={1}
                            onChange={(e) => {
                                setMessage(e.target.value)
                            }}
                            className="block placeholder:text-base-content h-auto mx-4 p-2.5 w-full text-base text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 " placeholder="Your message..."></textarea>
                        <button className="btn btn-neutral rounded-full" onClick={sendMessage}>
                            <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                            </svg>
                            <span className="sr-only">Send message</span>
                        </button>
                    </div>
                </div >
            )}
            {/* <div className='flex flex-col items-center  w-screen min-h-screen bg-gray-100 text-gray-800 '>
                <div className='flex flex-col items-center  w-screen min-h-screen bg-gray-100 text-gray-800 p-6'>
                    <div className='flex flex-col flex-grow w-full max-w-xl lg:max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden'>
                        <div className='flex flex-col flex-grow h-0 p-4 overflow-auto'>
                            {allMessages.length !== 0 ? allMessages?.map((messages) => {
                                return (<div key={messages.userId}>
                                    <div className={`flex w-full mt-2 space-x-3 max-w-xs${messages.type === 'sent' ? 'ml-auto justify-end' : ''}`}>
                                        {messages.type === 'received' && messages.userId && <div className="flex-col text-wrap text-center pt-2 font-bold text-gray-600 text-base h-10 w-10 rounded-full bg-gray-300">{messages?.userId.charAt(0).toUpperCase()}</div>}
                                        <div>
                                            <div className={` p-3 ${messages?.type === 'sent' ? 'bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg' : 'bg-gray-300 rounded-r-lg rounded-bl-lg'}`}>
                                                <p className="text-sm">{messages?.message}</p>
                                            </div>
                                        </div>
                                        {messages?.type === 'sent' && messages?.userId && <div className="flex-shrink-0 text-base text-center pt-2 font-semibold text-gray-600 h-10 w-10 rounded-full bg-gray-300">{messages?.userId.charAt(0).toUpperCase()}</div>}
                                    </div>
                                </div>)
                            }) : (<div className='text-pretty text-center text-gray-400'>Start Broadcasting the messages</div>)}
                        </div>
                        <div className='fixed bottom-0 left-0 right-0'>
                            <div className="flex items-center px-3 py-2 md:mx-12 rounded-xl bg-gray-100">
                                <textarea id="chat" value={sentMessage}
                                    rows={1} onChange={(e) => {
                                        setsentMessage(e.target.value)
                                    }} className="block h-auto mx-4 p-2.5 w-full text-base text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 " placeholder="Your message..."></textarea>
                                <button onClick={sendMessage} className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100">
                                    <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                        <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                                    </svg>
                                    <span className="sr-only">Send message</span>
                                </button>
                            </div>
                        </div >
                    </div >
                </div>
            </div> */}
        </div>
    )
}

export default ChatPage
