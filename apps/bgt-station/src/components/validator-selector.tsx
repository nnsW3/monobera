import React, { useEffect, useMemo, useState } from "react";
import {
  truncateHash,
  useBeraJs,
  usePollValidatorInfo,
  useSelectedValidator,
  useValidatorList,
  useValidValidator,
} from "@bera/berajs";
import { SearchInput, SSRSpinner, ValidatorIcon } from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import { Dialog, DialogContent } from "@bera/ui/dialog";
import { Icons } from "@bera/ui/icons";
import { type Address } from "viem";

import { AllValidator } from "~/app/validators/components/all-validator";
import { MyValidator } from "~/app/validators/components/my-validators";

export default function ValidatorSelector({
  validatorAddress = "0x",
  onSelectValidator,
  showDelegated = false,
  filter,
  showSearch,
}: {
  validatorAddress?: Address;
  onSelectValidator?: (address: string) => void;
  showDelegated?: boolean;
  filter?: Address[];
  showSearch?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  //@ts-ignore

  const { data: isValidValidator, isLoading: isValidValidatorLoading } =
    useValidValidator(validatorAddress, {
      opts: {
        refreshInterval: 0,
      },
    });

  const { data: validatorInfo, isLoading: isValidatorListLoading } =
    useValidatorList({
      opts: {
        refreshInterval: 0,
      },
    });

  const selectedValidatorInfo = useMemo(() => {
    return validatorInfo?.validatorDictionary
      ? validatorInfo?.validatorDictionary[validatorAddress.toLowerCase()]
      : undefined;
  }, [isValidValidator, validatorInfo]);

  const isLoading =
    validatorAddress !== "0x" &&
    (isValidValidator === undefined ||
      isValidValidatorLoading ||
      isValidatorListLoading);
  return (
    <div>
      <Button
        variant="outline"
        className="ml-3 min-w-[148px] whitespace-nowrap border-border bg-background shadow"
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        {isValidValidator ? (
          <div className="flex items-center gap-2 text-base font-medium leading-normal">
            <ValidatorIcon
              address={validatorAddress}
              className="h-8 w-8"
              imgOverride={selectedValidatorInfo?.logoURI}
            />
            {selectedValidatorInfo?.name ?? truncateHash(validatorAddress)}
            <Icons.chevronDown className="relative h-3 w-3" />
          </div>
        ) : isLoading ? (
          <div className="w-full flex flex-row gap-2 items-center">
            <SSRSpinner />
            Loading...
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium leading-normal sm:text-base">
            Select Validator
            <Icons.chevronDown className="relative h-3 w-3" />
          </div>
        )}
      </Button>
      <ValidatorModal
        open={open}
        unbond={showDelegated}
        onClose={() => setOpen(false)}
        onSelect={(address) => onSelectValidator?.(address)}
        showSearch={showSearch}
      />
    </div>
  );
}

const ValidatorModal = ({
  open,
  unbond,
  showSearch,
  onClose,
  onSelect,
}: {
  open: boolean;
  unbond?: boolean;
  showSearch?: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
}) => {
  const { isReady } = useBeraJs();
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const [keyword, setKeyword] = useState("");
  const [showDelegated, setShowDelegated] = useState(false);

  useEffect(() => {
    return () => {
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [typingTimer]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full justify-center sm:max-w-fit">
        <div className="flex w-[100vw] flex-col gap-4 p-6 lg:w-fit">
          <div className="text-lg font-semibold leading-7">
            Validator select
          </div>

          <div className="flex items-center justify-between">
            <SearchInput
              placeholder="Search by name or address"
              className="w-full md:w-[400px]"
              value={keyword}
              onChange={(e: any) => {
                setKeyword(e.target.value);
                setIsTyping?.(true);
                if (typingTimer) clearTimeout(typingTimer);
                const newTimer = setTimeout(() => {
                  setIsTyping(false);
                }, 1000);
                setTypingTimer(newTimer);
              }}
            />
            {!unbond &&
              (showDelegated ? (
                <Button
                  className="w-fit whitespace-nowrap"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDelegated(false)}
                >
                  Show All Validators
                </Button>
              ) : (
                <Button
                  className="w-fit whitespace-nowrap"
                  size="sm"
                  onClick={() => setShowDelegated(true)}
                >
                  Show Delegated Only
                </Button>
              ))}
          </div>

          {unbond || showDelegated ? (
            <MyValidator
              keyword={keyword}
              onRowClick={(row: any) => {
                onSelect(row.original.coinbase);
                onClose();
              }}
            />
          ) : (
            <AllValidator
              user={isReady}
              keyword={keyword}
              isTyping={isTyping}
              onRowClick={(row: any) => {
                onSelect(row.original.coinbase);
                onClose();
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
