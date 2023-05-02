import { RadioGroup } from "@headlessui/react";
import { StarIcon } from "@heroicons/react/20/solid";
import classNames from "../lib/classNames";
import { useState } from "react";

type RatingSize = "small" | "medium";

type Props = {
  value: number;
  size: RatingSize;
  className?: string;
};

export const StaticRating = ({ value, size, className }: Props) => {
  return (
    <div
      className={classNames(
        "rating",
        size === "small" ? "rating-sm" : "",
        className
      )}
    >
      {[5, 4, 3, 2, 1].map((item) => {
        return [
          <div
            className={classNames(
              "text-gray-200",
              "rating-half-2",
              value >= item ? "text-yellow-500" : ""
            )}
          >
            <StarIcon className="h-full" />
          </div>,
          <div
            className={classNames(
              "text-gray-200",
              "rating-half-1",
              value >= item - 0.5 ? "text-yellow-500" : ""
            )}
          >
            <StarIcon className="h-full" />
          </div>,
        ];
      })}
    </div>
  );
};

export default ({
  onChange,
  ...props
}: {
  value?: number | null | undefined;
  onChange: (value: number) => void;
}) => {
  const [value, setValue] = useState<number>(props.value || 0);

  return (
    <RadioGroup
      {...props}
      onChange={(value) => {
        setValue(value || 0);
        onChange(value || 0);
      }}
    >
      <div className="rating">
        {[5, 4, 3, 2, 1].map((item) => {
          return [
            <RadioGroup.Option
              key={item}
              value={item}
              className={({ active, checked }) =>
                classNames(
                  "cursor-pointer text-gray-200",
                  "hover:text-yellow-600",
                  "rating-half-2",
                  "peer",
                  "peer-hover:text-yellow-500",
                  active ? "text-yellow-500" : "",
                  checked ? "text-yellow-500" : "",
                  value >= item ? "text-yellow-500" : ""
                )
              }
            >
              <RadioGroup.Label as={StarIcon} className="h-full" />
            </RadioGroup.Option>,
            <RadioGroup.Option
              key={item - 0.5}
              value={item - 0.5}
              className={({ active, checked }) =>
                classNames(
                  "cursor-pointer text-gray-200",
                  "hover:text-yellow-600",
                  "rating-half-1",
                  "peer",
                  "peer-hover:text-yellow-500",
                  active ? "text-yellow-500" : "",
                  checked ? "text-yellow-500" : "",
                  value >= item - 0.5 ? "text-yellow-500" : ""
                )
              }
            >
              <RadioGroup.Label as={StarIcon} className="h-full" />
            </RadioGroup.Option>,
          ];
        })}
      </div>
    </RadioGroup>
  );
};
