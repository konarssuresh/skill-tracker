import { forwardRef } from "react";
import { TextInput } from "@/components/ui/text-input";

export const NumberInput = forwardRef(function NumberInput(props, ref) {
  return (
    <TextInput
      ref={ref}
      type="number"
      inputMode={props.step && `${props.step}`.includes(".") ? "decimal" : "numeric"}
      {...props}
    />
  );
});
