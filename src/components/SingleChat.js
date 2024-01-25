import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client"
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal"
import Lottie from "react-lottie"
import { ChatState } from "../Context/ChatProvider"
import animationData from "../animations/typing.json"

let socket, selectedChatCompare
const defaultOptions = {
	loop: true,
	autoplay: true,
	animationData: animationData,
	rendererSettings: {
		preserveAspectRatio: "xMidYMid slice",
	},
}

function SingleChat({ fetchAgain, setFetchAgain }) {
	const [messages, setMessages] = useState([])
	const [loading, setLoading] = useState(false)
	const [newMessage, setNewMessage] = useState("")
	const toast = useToast()
	const [socketConnected, setSocketConnected] = useState(false)
	const [typing, setTyping] = useState(false)
	const [isTyping, setIsTyping] = useState(undefined)

	const { selectedChat, setSelectedChat, user, notification, setNotification } =
		ChatState()
	useEffect(() => {
		socket = io(process.env.REACT_APP_BASE_URL)
		socket.emit("setup", user)
		socket.on("connected", () => setSocketConnected(true))
		if (selectedChat) {
			socket.emit("joinChat", selectedChat._id)
			socket.on("ftyping", () => setIsTyping(true))
			socket.on("fstopTyping", () => setIsTyping(false))
		}
	}, [selectedChat, user])

	const fetchMessages = async () => {
		if (!selectedChat) return

		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}

			setLoading(true)

			const { data } = await axios.get(
				`${process.env.REACT_APP_BASE_URL}/api/message/${selectedChat._id}`,
				config
			)
			setMessages(data)
			setLoading(false)
			socket.emit("joinChat", selectedChat._id)
		} catch (error) {
			toast({
				title: "Error Occured!",
				description: "Failed to Load the Messages",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			})
		}
	}
	const sendMessage = async (event) => {
		if (event.key === "Enter" && newMessage) {
			// socket.emit("stopTyping", selectedChat._id)
			try {
				const config = {
					headers: {
						"Content-type": "application/json",
						Authorization: `Bearer ${user.token}`,
					},
				}
				setNewMessage("")
				const { data } = await axios.post(
					`${process.env.REACT_APP_BASE_URL}/api/message`,
					{
						content: newMessage,
						chatId: selectedChat._id,
					},
					config
				)
				socket.emit("newMessage", data)
				setMessages((messages) => [...messages, data])
			} catch (error) {
				toast({
					title: "Error Occured!",
					description: "Failed to send the Message",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				})
			}
		}
	}
	useEffect(() => {
		fetchMessages()
		selectedChatCompare = selectedChat
	}, [selectedChat])

	useEffect(() => {
		socket.on("messageReceived", (messageReceived) => {
			if (
				!selectedChatCompare ||
				selectedChatCompare._id !== messageReceived.chat._id
			) {
				// give notification
				// console.log("my notification", notification)
				// if (
				// 	!notification.some((message) => {
				// 		console.log(message.chat._id, messageReceived.chat._id)
				// 		return message.chat._id === messageReceived.chat._id
				// 	})
				// ) {
				// 	setNotification([messageReceived, ...notification])
				// 	setFetchAgain(!fetchAgain)
				// }
			} else {
				setMessages([...messages, messageReceived])
			}
		})
	})

	const typingHandler = (e) => {
		setNewMessage(e.target.value)
		if (!socketConnected) return

		if (!typing) {
			setTyping(true)
			socket.emit("typing", selectedChat._id)
		}

		setTimeout(() => {
			socket.emit("stopTyping", selectedChat._id)
			setTyping(false)
		}, 1000)
	}
	return (
		<>
			{selectedChat ? (
				<>
					<Text
						fontSize={{ base: "28px", md: "30px" }}
						pb={3}
						px={2}
						w="100%"
						fontFamily="Work sans"
						display="flex"
						justifyContent={{ base: "space-between" }}
						alignItems="center">
						<IconButton
							d={{ base: "flex", md: "none" }}
							icon={<ArrowBackIcon />}
							onClick={() => setSelectedChat("")}
						/>
						{messages && !selectedChat.isGroupChat ? (
							<>
								{getSender(user, selectedChat.users)}
								<ProfileModal user={getSenderFull(user, selectedChat.users)} />
							</>
						) : (
							<>
								{selectedChat.chatName.toUpperCase()}
								<UpdateGroupChatModal
									fetchMessages={fetchMessages}
									fetchAgain={fetchAgain}
									setFetchAgain={setFetchAgain}
								/>
							</>
						)}
					</Text>
					<Box
						display="flex"
						flexDir="column"
						justifyContent="flex-end"
						p={3}
						bg="#E8E8E8"
						w="100%"
						h="92.5%"
						borderRadius="lg"
						overflowY="hidden">
						{loading ? (
							<Spinner
								size="xl"
								w={20}
								h={20}
								alignSelf="center"
								margin="auto"
							/>
						) : (
							<div className="messages">
								<ScrollableChat messages={messages} />
							</div>
						)}

						<FormControl
							onKeyDown={sendMessage}
							id="first-name"
							isRequired
							mt={3}>
							{isTyping ? (
								<div>
									<Lottie
										options={defaultOptions}
										// height={50}
										width={70}
										style={{ marginBottom: 15, marginLeft: 0 }}
									/>
								</div>
							) : (
								<></>
							)}
							<Input
								variant="filled"
								bg="#E0E0E0"
								placeholder="Enter a message.."
								value={newMessage}
								onChange={typingHandler}
							/>
						</FormControl>
					</Box>
				</>
			) : (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					h="100%">
					<Text
						fontSize="3xl"
						pb={3}
						fontFamily="Work sans">
						Click on a user to start chatting
					</Text>
				</Box>
			)}
		</>
	)
}

export default SingleChat
