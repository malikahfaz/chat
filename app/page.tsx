// app/page.tsx

"use client";

import { LinkBar, MessageList, WelcomeForm, InputForm } from './components';
import { useChatState, useChatManager, useStartAssistant } from './hooks';

export default function Chat() {
  const {
    assistantName, setAssistantName,
    assistantModel, setAssistantModel,
    assistantDescription, setAssistantDescription,
    inputmessage, setInputmessage,
    chatMessages, setChatMessages,
    isButtonDisabled, setIsButtonDisabled,
    files = [], setFiles,
    isStartLoading, setStartLoading,
    statusMessage, setStatusMessage,
    isSending, setIsSending,
    inputRef,
    formRef,
    initialThreadMessage, 
    setInitialThreadMessage,
    setChatStarted,
    chatStarted: chatHasStarted,
    chatManager, setChatManager,
    assistantId,
    isMessageLoading, setIsMessageLoading,
    progress, setProgress, 
    isLoadingFirstMessage,
    setIsLoadingFirstMessage,
    chatUploadedFiles = [], setChatUploadedFiles,
    chatFileDetails, setChatFileDetails,
  } = useChatState();

  



  useChatManager(setChatMessages, setStatusMessage, setChatManager, setIsMessageLoading, setProgress, setIsLoadingFirstMessage);
  useStartAssistant(assistantId, chatManager, initialThreadMessage);


  const startChatAssistant = async () => {
    setIsButtonDisabled(true);
    setStartLoading(true);
    if (chatManager) {
      try {
        await chatManager.startAssistant({ assistantName, assistantModel, assistantDescription }, files, initialThreadMessage);
        console.log('Assistant started:', chatManager.getChatState());
        setChatStarted(true);
      } catch (error) {
        console.error('Error starting assistant:', error);
        if (error instanceof Error) setStatusMessage(`Error: ${error.message}`);
      } finally {
        setIsButtonDisabled(false);
        setStartLoading(false);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSending) {
      return;
    }
    const message = inputmessage;
    setInputmessage('');
    setIsSending(true);
    if (chatManager) {
      const currentFiles = chatUploadedFiles; // Save current files
      setChatUploadedFiles([]); // Reset the state after files are uploaded
      setChatFileDetails([]); // Reset the file details state
      try {
        await chatManager.sendMessage(message, currentFiles, chatFileDetails); // Send the saved files and file details
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsSending(false);
      }
    }
  };
  
  //This function takes an array of File objects (the files selected by the user) and uses the setFiles function to update the files state.
  const handleFilesChange = (selectedFiles: File[]) => setFiles(selectedFiles);

  const handleChatFilesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      if (chatFileDetails.length + newFiles.length > 10) {
        alert('You can only upload up to 10 files.');
        return;
      }
      const fileArray = newFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));
      setChatFileDetails(prevFiles => [...prevFiles, ...fileArray]);
      setChatUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
    event.target.value = ''; // Clear the input's value
  };

  const removeChatFile = (fileName: string) => {
    const updatedFileDetails = chatFileDetails.filter((file) => file.name !== fileName);
    setChatFileDetails(updatedFileDetails);
  
    const updatedUploadedFiles = chatUploadedFiles.filter((file) => file.name !== fileName);
    setChatUploadedFiles(updatedUploadedFiles);
  };

  return (
    <main className="flex flex-col items-center justify-between pb-40 bg-space-grey-light">
      <LinkBar />
      {chatHasStarted || assistantId || isLoadingFirstMessage  ? (
        <MessageList chatMessages={chatMessages} statusMessage={statusMessage} isSending={isSending} progress={progress} isFirstMessage={isLoadingFirstMessage} fileDetails={chatFileDetails} />
      ) : (
        <WelcomeForm {...{assistantName, setAssistantName, assistantDescription, setAssistantDescription, assistantModel, setAssistantModel, files, handleFilesChange, startChatAssistant, isButtonDisabled, isStartLoading, statusMessage}} />
      )}
      <InputForm {...{input: inputmessage, setInput: setInputmessage, handleFormSubmit, inputRef, formRef, disabled: isButtonDisabled || !chatManager, chatStarted: chatMessages.length > 0, isSending, isLoading: isMessageLoading, handleChatFilesUpload, chatFileDetails, removeChatFile}} />
    </main>
  );
}
