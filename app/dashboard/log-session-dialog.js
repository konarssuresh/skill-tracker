"use client";

import { useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import validator from "validator";
import {
  Button,
  DateInput,
  Dialog,
  SelectInput,
  showSuccessToast,
  TextInput,
  Textarea,
} from "@/components/ui";
import { useUiStore } from "@/stores/ui-store";
import { apiRequest } from "@/utils/api";
import { cn } from "@/utils/cn";

const durationPresets = [
  { label: "15m", value: "15" },
  { label: "30m", value: "30" },
  { label: "45m", value: "45" },
  { label: "1h", value: "1h" },
];

function getLocalDateString() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function RecentPresetButton({ label, value, active, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(value)}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-accent bg-accent-subtle text-accent"
          : "border-border bg-surface text-text-secondary hover:bg-bg-secondary",
      )}
    >
      {label}
    </motion.button>
  );
}

export function LogSessionDialog({ skills = [] }) {
  const queryClient = useQueryClient();
  const initialFocusRef = useRef(null);
  const isOpen = useUiStore((state) => state.isLogSessionDialogOpen);
  const closeDialog = useUiStore((state) => state.closeLogSessionDialog);
  const defaultValues = useMemo(
    () => ({
      skillId: skills[0]?.id ?? "",
      duration: "",
      sessionDate: getLocalDateString(),
      notes: "",
    }),
    [skills],
  );

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

  const selectedDuration = useWatch({
    control,
    name: "duration",
  });

  const sessionMutation = useMutation({
    mutationFn: async (values) => {
      return apiRequest("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          skillId: values.skillId,
          duration: values.duration,
          sessionDate: values.sessionDate,
          notes: values.notes,
        }),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["skills"] }),
        queryClient.invalidateQueries({ queryKey: ["sessions"] }),
      ]);
      showSuccessToast({
        title: "Session logged",
        message: "Your dashboard has been updated with the new practice entry.",
        toastId: "log-session-success",
      });
      reset({
        ...defaultValues,
        skillId: skills[0]?.id ?? "",
      });
      closeDialog();
    },
  });

  const onSubmit = handleSubmit((values) => {
    sessionMutation.mutate(values);
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset({
            ...defaultValues,
            skillId: skills[0]?.id ?? "",
          });
          closeDialog();
        }
      }}
      title="Log a practice session"
      description="Capture the work while it’s still fresh. Keep it quick or add notes while the details are still vivid."
      initialFocusRef={initialFocusRef}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              reset({
                ...defaultValues,
                skillId: skills[0]?.id ?? "",
              });
              closeDialog();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="log-session-form"
            disabled={sessionMutation.isPending || isSubmitting}
          >
            {sessionMutation.isPending ? "Saving session..." : "Save session"}
          </Button>
        </div>
      }
    >
      <form
        id="log-session-form"
        onSubmit={onSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="skillId"
            control={control}
            rules={{
              validate: (value) => {
                if (!value || !validator.isMongoId(value)) {
                  return "Choose a skill";
                }

                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <SelectInput
                {...field}
                ref={(node) => {
                  field.ref(node);
                  initialFocusRef.current = node;
                }}
                label="Skill"
                error={fieldState.error}
                required
              >
                <option value="">Select a skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </SelectInput>
            )}
          />

          <Controller
            name="sessionDate"
            control={control}
            rules={{
              validate: (value) => {
                if (!value) {
                  return "Date is required";
                }

                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <DateInput
                {...field}
                label="Date"
                max={getLocalDateString()}
                error={fieldState.error}
                required
              />
            )}
          />
        </div>

        <Controller
          name="duration"
          control={control}
          rules={{
            validate: (value) => {
              if (!value || validator.isEmpty(value.trim())) {
                return "Duration is required";
              }

              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Duration"
              placeholder='Examples: 45, 1h 30m, 1.5'
              hint="Supports minutes, hour/minute format, or decimal hours."
              error={fieldState.error}
              required
            />
          )}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-text-primary">Quick presets</p>
          <div className="flex flex-wrap gap-3">
            {durationPresets.map((preset) => (
              <RecentPresetButton
                key={preset.value}
                {...preset}
                active={selectedDuration === preset.value}
                onClick={(nextValue) => setValue("duration", nextValue, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })}
              />
            ))}
          </div>
        </div>

        <Controller
          name="notes"
          control={control}
          render={({ field, fieldState }) => (
            <Textarea
              {...field}
              label="Notes"
              placeholder="What did you work on? What clicked? What needs more attention next time?"
              hint="Optional, but useful for future reflection."
              error={fieldState.error}
              rows={5}
            />
          )}
        />

        {sessionMutation.error ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-error/20 bg-red-50 px-4 py-3 text-sm text-error"
          >
            {sessionMutation.error.message}
          </motion.div>
        ) : null}
      </form>
    </Dialog>
  );
}
