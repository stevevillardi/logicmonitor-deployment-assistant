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
        <div className="rounded-lg p-4 transition-all">
            <div className="flex items-center">
                <div className="flex items-center gap-2 min-w-[200px]">
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
                    <Label htmlFor="collector-calc-method" className="text-sm text-gray-600">
                        Collector Sizing Method:
                    </Label>
                </div>
                <div className="w-[130px]">
                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger 
                            id="collector-calc-method"
                            className="w-full bg-white border-gray-200 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#040F4B] focus:border-blue-500"
                        >
                            <SelectValue placeholder="Method..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="w-[130px] bg-white border-gray-200">
                            <SelectItem value="auto" className="text-sm">
                                Auto
                            </SelectItem>
                            <SelectItem value="SMALL" className="text-sm">
                                Use Small
                            </SelectItem>
                            <SelectItem value="MEDIUM" className="text-sm">
                                Use Medium
                            </SelectItem>
                            <SelectItem value="LARGE" className="text-sm">
                                Use Large
                            </SelectItem>
                            <SelectItem value="XL" className="text-sm">
                                Use XL
                            </SelectItem>
                            <SelectItem value="XXL" className="text-sm">
                                Use XXL
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
} 