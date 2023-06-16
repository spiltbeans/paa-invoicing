import '../styles/globals.css'
import { Providers } from '@/Providers'
export const metadata = {
	title: 'Invoicing Analytics',
	description: 'Analyze invoicing data for trends',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	)
}
