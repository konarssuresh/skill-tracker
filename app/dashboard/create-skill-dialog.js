"use client";

import { useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import validator from "validator";
import {
  Button,
  Dialog,
  NumberInput,
  showSuccessToast,
  TextInput,
} from "@/components/ui";
import { useUiStore } from "@/stores/ui-store";
import { apiRequest } from "@/utils/api";
import { cn } from "@/utils/cn";

const skillColors = [
  "#059669",
  "#8B5CF6",
  "#3B82F6",
  "#EF4444",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

const defaultValues = {
  name: "",
  color: skillColors[0],
  goalType: "",
  goalTargetMinutes: "",
};

function GoalToggle({ value, onChange }) {
  const options = [
    { value: "", label: "No goal" },
    { value: "weekly", label: "Weekly goal" },
    { value: "total", label: "Total goal" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-primary">Goal</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const active = value === option.value;

          return (
            <motion.button
              key={option.value || "none"}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border bg-surface text-text-secondary hover:bg-bg-secondary",
              )}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ColorPalette({ value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-primary">Color</p>
      <div className="flex flex-wrap gap-3">
        {skillColors.map((color) => {
          const active = color === value;

          return (
            <motion.button
              key={color}
              type="button"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(color)}
              className={cn(
                "relative h-12 w-12 rounded-full border-4 shadow-sm transition-shadow",
                active ? "border-white shadow-lg" : "border-transparent",
              )}
              style={{
                backgroundColor: color,
                boxShadow: active
                  ? `0 0 0 2px ${color}, 0 12px 22px -12px ${color}`
                  : undefined,
              }}
              aria-label={`Choose ${color} as skill color`}
              aria-pressed={active}
            >
              {active ? (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white"
                >
                  ✓
                </motion.span>
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function CreateSkillDialog() {
  const queryClient = useQueryClient();
  const initialFocusRef = useRef(null);
  const isOpen = useUiStore((state) => state.isCreateSkillDialogOpen);
  const closeDialog = useUiStore((state) => state.closeCreateSkillDialog);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const goalType = useWatch({
    control,
    name: "goalType",
  });

  const skillMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        name: values.name.trim(),
        color: values.color,
        goal: values.goalType
          ? {
              type: values.goalType,
              targetMinutes: Number(values.goalTargetMinutes),
            }
          : undefined,
      };

      return apiRequest("/api/skills", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      showSuccessToast({
        title: "Skill created",
        message: "Your new skill is ready for session logging.",
        toastId: "create-skill-success",
      });
      reset(defaultValues);
      closeDialog();
    },
  });

  const helperText = useMemo(() => {
    if (goalType === "weekly") {
      return "Set the number of minutes you want to practice each week.";
    }

    if (goalType === "total") {
      return "Set the total number of minutes you want to invest in this skill.";
    }

    return "Goals are optional, but they make progress rings meaningful.";
  }, [goalType]);

  const onSubmit = handleSubmit((values) => {
    skillMutation.mutate(values);
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset(defaultValues);
          closeDialog();
        }
      }}
      title="Create a new skill"
      description="Give your practice a home. Pick a color, optionally set a goal, and start logging sessions."
      initialFocusRef={initialFocusRef}
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              reset(defaultValues);
              closeDialog();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-skill-form"
            disabled={skillMutation.isPending || isSubmitting}
          >
            {skillMutation.isPending ? "Creating skill..." : "Create skill"}
          </Button>
        </div>
      }
    >
      <form id="create-skill-form" onSubmit={onSubmit} className="space-y-6" noValidate>
        <Controller
          name="name"
          control={control}
          rules={{
            validate: (value) => {
              if (!value || validator.isEmpty(value.trim())) {
                return "Skill name is required";
              }

              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              ref={(node) => {
                field.ref(node);
                initialFocusRef.current = node;
              }}
              label="Skill name"
              placeholder="Spanish, Guitar, TypeScript..."
              error={fieldState.error}
              required
            />
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorPalette value={field.value} onChange={field.onChange} />
          )}
        />

        <Controller
          name="goalType"
          control={control}
          render={({ field }) => (
            <GoalToggle
              value={field.value}
              onChange={(nextValue) => {
                field.onChange(nextValue);

                if (!nextValue) {
                  setValue("goalTargetMinutes", "");
                }
              }}
            />
          )}
        />

        <AnimatePresence initial={false}>
          {goalType ? (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Controller
                name="goalTargetMinutes"
                control={control}
                rules={{
                  validate: (value) => {
                    if (!goalType) {
                      return true;
                    }

                    if (value === "" || value == null) {
                      return "Goal target is required";
                    }

                    if (!validator.isInt(`${value}`, { min: 1 })) {
                      return "Goal target must be at least 1 minute";
                    }

                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <NumberInput
                    {...field}
                    label={goalType === "weekly" ? "Weekly goal (minutes)" : "Total goal (minutes)"}
                    min={1}
                    step={1}
                    placeholder={goalType === "weekly" ? "300" : "1200"}
                    hint={helperText}
                    error={fieldState.error}
                    required
                  />
                )}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {skillMutation.error ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-error/20 bg-red-50 px-4 py-3 text-sm text-error"
          >
            {skillMutation.error.message}
          </motion.div>
        ) : null}
      </form>
    </Dialog>
  );
}
