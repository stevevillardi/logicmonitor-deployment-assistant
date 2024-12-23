import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Zap, Server } from "lucide-react"
import { collectorCapacities } from "../DeploymentAssistant/utils/constants"

interface CollectorCalcMethodSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export const CollectorCalcMethodSelect = ({ value, onChange }: CollectorCalcMethodSelectProps) => {
    return (
        <div className="rounded-lg transition-all">
            <div className="flex items-center gap-2">
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
                <Label htmlFor="collector-calc-method" className="text-sm text-gray-600 whitespace-nowrap">
                    Collector Sizing:
                </Label>
                <Select
                    value={value}
                    onValueChange={onChange}
                >
                    <SelectTrigger 
                        className="w-[200px] h-9 bg-white border-gray-200 text-gray-900"
                    >
                        <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                    <SelectContent 
                        className="bg-white border-gray-200"
                    >
                        <SelectGroup>
                            <SelectLabel 
                                className="text-gray-500"
                            >
                                Collector Size Method
                            </SelectLabel>
                            <SelectItem 
                                value="auto" 
                                className="text-gray-900 focus:bg-gray-100"
                            >
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-700" />
                                    <span>Auto</span>
                                </div>
                            </SelectItem>
                            {Object.entries(collectorCapacities).map(([size]) => (
                                <SelectItem 
                                    key={size} 
                                    value={size}
                                    className="text-gray-900 focus:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <Server className="w-4 h-4 text-blue-700" />
                                        <span>Force {size}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
} 