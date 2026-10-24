import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

function ListItemSkelton() {
    return (
        <Button className="w-full justify-start" variant="ghost">
            <Skeleton className="w-full h-4" />
        </Button>
    )
}

export default ListItemSkelton
