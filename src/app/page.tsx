import Dashboard from '@/components/Dashboard'

export default async function Home() {
	// const {handler} = await import("./api/sheet-names/route");

	// await (await handler()).json()
	return (
		<div className="w-full flex flex-col items-center p-10 gap-5">
			<h1 className='text-2xl font-bold'>Work Description Report</h1>
			<Dashboard />
		</div>
	)
}
