import AppInput from "@/components/forms/AppInput";
import AppSelect from "@/components/forms/AppSelect";
import AppTextArea from "@/components/forms/AppTextArea";
import { SiteHeader } from "@/components/layouts/site-header";
import type { IOption } from "@/types/Option";
import { Button, Card, CardBody, CardHeader, Chip, cn, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, TrashIcon } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import z from "zod";

interface PlanCardProps {
	title: string;
	chipText?: string;
	price: string;
	text: string;
	subText?: string;
	cardBgColor?: string;
	isCurrentPlan?: boolean;
	onBtnClick?: VoidFunction;
	features: string[];
}

const planFeatsSchema = z.object({
	text: z.string().min(1, "Type something on feature"),
});

const planFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	tag: z.string(),
	description: z.string().min(1, "Plan description is required"),
	text: z.string(),
	price: z.coerce.number().min(0, "Price must be positive"),
	paymentPlan: z.string().min(1, "Choose payment plan"),
	features: z.array(planFeatsSchema).min(1, "Have atleast one feature for the plan"),
});

const paymentOptions = [
	{ label: "Weekly", value: "week" },
	{ label: "Monthly", value: "month" },
	{ label: "Annually", value: "year" },
] satisfies IOption[];

const PlansPage = () => {
	return (
		<>
			<SiteHeader title="Plans" />
			<div className="py-3 px-3 space-y-1">
				<div className="flex items-center justify-between">
					<h1 className="font-semibold text-xl">Manage your payment plans here</h1>
					<NewPlanModal />
				</div>
				<p className="text-gray-600 text-sm">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestias, ea?</p>
			</div>
			<div className="mt-6 px-3">
				<PlanCard
					title="Strategic Climate Planner"
					chipText="Best-Value"
					text="For growing teams ready to integrate climate into business operations."
					subText="Ideal for: Institutions and corporates seek deeper climate alignment."
					price="$20/month"
					features={[
						"Everything in compliance starter",
						"Scope 1, 2 & Select Scope 3 Modules (Employee Commute, Business Travel)",
						"Multi-user / Multi-location Support.",
						"Emissions Reduction Tracking Dashboard- Net zero",
						"Self-paced climate strategy modules",
						"Custom Action Plans Based on Sector & Region",
					]}
				/>
			</div>
		</>
	);
};

const PlanCard = ({ title, chipText, price, text, subText, cardBgColor = "bg-[#EED2AD]", isCurrentPlan = false, onBtnClick, features }: PlanCardProps) => {
	return (
		<Card className={cn("px-5 py-4", cardBgColor)}>
			<CardHeader className="gap-5">
				<h1 className="text-sm">{title}</h1>
				{chipText && (
					<Chip variant="bordered" size="sm" classNames={{ content: "text-sm" }}>
						<p className="text-sm">{chipText}</p>
					</Chip>
				)}
			</CardHeader>
			<CardBody>
				<div className="grid grid-cols-1 md:grid-cols-8 gap-5">
					<div className="col-auto md:col-span-3">
						<div className="space-y-5">
							<h1 className="text-xl text-saastain-green font-bold">{price}</h1>
							<p className="text-gray-700 text-sm w-4/5">{text}</p>
							{subText && <p className="text-sm font-extralight italic">Ideal for: SMEs complying with a government/financier mandate.</p>}
							<Button color="secondary">Create Payment Link</Button>
						</div>
					</div>
					<div className="col-auto md:col-span-5">
						<div className="grid grid-cols-2 gap-3">
							{features.map((feat, idx) => (
								<div key={idx} className="flex gap-2 items-center">
									<div className="size-7 border border-black flex items-center justify-center rounded-full">
										<CheckIcon className="w-4 h-4" />
									</div>
									<p className="text-sm">{feat}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

const NewPlanModal = () => {
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	const formMethods = useForm<z.input<typeof planFormSchema>>({
		resolver: zodResolver(planFormSchema),
		defaultValues: {
			title: "",
			description: "",
			text: "",
			features: [{ text: "" }],
			tag: "",
			price: 1,
			paymentPlan: "month"
		},
	});

	const {
		handleSubmit,
		formState: { errors: formErrors },
		control,
		reset,
	} = formMethods;

	const { fields, append, remove } = useFieldArray({ control, name: "features" });

	const onSubmit = handleSubmit(async (data) => {
		console.log('Data', data)
	});
	return (
		<>
			<Button color="secondary" onPress={onOpen}>
				New Plan
			</Button>
			<Modal size="2xl" isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent className="font-nunito">
					{(onClose) => (
						<FormProvider {...formMethods}>
							<form onSubmit={onSubmit}>
								<ModalHeader className="">Setup New Plan</ModalHeader>
								<ModalBody>
									<div className="grid grid-cols-2 gap-3">
										<AppInput label={"Title"} placeholder="Starter plan" labelPlacement="inside" name="title" control={control} error={formErrors.title} />
										<AppInput label={"Tag (optional)"} placeholder="Best Plan" labelPlacement="inside" name="tag" control={control} error={formErrors.tag} />
										<AppTextArea label="Description" placeholder="Type something ..." labelPlacement="inside" name="description" control={control} error={formErrors.description} />
										<AppTextArea label="Plan ideal text (optional)" placeholder="e.g. Ideal for small businesses" labelPlacement="inside" name="text" control={control} error={formErrors.text} />
										<AppInput label={"Price"} placeholder="e.g. 1" labelPlacement="inside" name="price" control={control} error={formErrors.price as any} type="number" />
										<AppSelect label="Payment Plan" placeholder="Choose ..." options={paymentOptions} name="paymentPlan" control={control} error={formErrors.paymentPlan} />
									</div>
									<Divider />
									<p>Features</p>
									{fields.map((feat, idx) => (
										<div key={feat.id} className="flex items-baseline gap-2">
											<AppInput label={"Feature 1"} placeholder="feat 1" labelPlacement="inside" name={`features.${idx}.text`} control={control} error={formErrors?.features?.[idx]?.text} />
											{fields.length > 1 && (
												<Button type="button" size="sm" isIconOnly color="danger" onPress={() => remove(idx)}>
													<TrashIcon className="w-5 h-5" />
												</Button>
											)}
										</div>
									))}
									<div className="">
										<Button onPress={() => append({ text: "" })} color="secondary" size="sm">
											Add another feature
										</Button>
									</div>
								</ModalBody>
								<ModalFooter>
									<Button type="button" onPress={onClose}>
										Close
									</Button>
									<Button color="secondary" type="submit">
										Save
									</Button>
								</ModalFooter>
							</form>
						</FormProvider>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default PlansPage;
