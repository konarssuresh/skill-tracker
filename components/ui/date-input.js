import { forwardRef } from "react";
import { TextInput } from "@/components/ui/text-input";

export const DateInput = forwardRef(function DateInput(props, ref) {
  return <TextInput ref={ref} type="date" {...props} />;
});
