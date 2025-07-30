import { Input } from "@/components/ui/input";

import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

const Rounded = ({
	value,
	onChange,
}: {
	value: number;
	onChange: (v: number) => void;
}) => {
	// Create local state to manage opacity
	const [localValue, setLocalValue] = useState(value);

	// Update local state when prop value changes
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	return (
		<div className="flex gap-2">
			<div className="flex flex-1 items-center text-sm text-muted-foreground">
				Round
			</div>
			<div
				className="w-32"
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 80px",
				}}
			>
				<Input
					className="h-8 w-11 px-2 text-center text-sm"
					type="number"
					onChange={(e) => {
						const newValue = Number(e.target.value);
						if (newValue >= 0 && newValue <= 100) {
							setLocalValue(newValue); // Update local state
							onChange(newValue); // Optionally propagate immediately, or adjust as needed
						}
					}}
					value={localValue} // Use local state for input value
				/>
				<Slider
					id="rounded"
					value={[localValue]} // Use local state for slider value
					onValueChange={(e) => {
						setLocalValue(e[0]); // Update local state
					}}
					onValueCommit={() => {
						onChange(localValue); // Propagate value to parent when user commits change
					}}
					min={0}
					max={50}
					step={1}
					aria-label="rounded"
				/>
			</div>
		</div>
	);
};

export default Rounded;
