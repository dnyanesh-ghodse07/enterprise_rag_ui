import { Message, MessageContent } from "../ui/message";
import { Skeleton } from "../ui/skeleton";

function MessageSkeloton({ count = 10 }: { count: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => {
                return (
                    <Message
                        key={index}
                        align={index % 2 == 0 ? "end" : "start"}
                        className={`my-2 p-2`}
                    >
                        <MessageContent className="justify-start">
                            <Skeleton className={`h-8 ${index % 2 == 0 ? `w-[300px]` : `w-[600px]`}`} />
                        </MessageContent>
                    </Message>
                )
            })}
        </>
    )
}

export default MessageSkeloton;