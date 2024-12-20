import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CollectorCalcMethodSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export const CollectorCalcMethodSelect = ({ value, onChange }: CollectorCalcMethodSelectProps) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 min-w-[200px]">
                    <Label htmlFor="collector-calc-method" className="text-sm text-gray-600">
                        Collector Sizing Method
                    </Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white border-gray-200">
                                <p className="text-sm">Choose how collector sizes are calculated.</p>
                                <p className="text-sm text-muted-foreground">Auto (recommended) will optimize for your workload.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="w-[100px]">
                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger 
                            id="collector-calc-method"
                            className="w-full bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <SelectValue placeholder="Select calculation method" className="w-[270px] truncate" />
                        </SelectTrigger>
                        <SelectContent className="w-[100px] bg-white border-gray-200">
                            <SelectItem value="auto" className="text-sm">
                                Auto
                            </SelectItem>
                            <SelectItem value="SMALL" className="text-sm">
                                Small
                            </SelectItem>
                            <SelectItem value="MEDIUM" className="text-sm">
                                Medium
                            </SelectItem>
                            <SelectItem value="LARGE" className="text-sm">
                                Large
                            </SelectItem>
                            <SelectItem value="XL" className="text-sm">
                                XL
                            </SelectItem>
                            <SelectItem value="XXL" className="text-sm">
                                XXL
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
} 