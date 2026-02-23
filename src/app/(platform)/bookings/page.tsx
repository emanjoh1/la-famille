import { getUserBookings } from "@/actions/bookings";
import { format } from "date-fns";

export default async function BookingsPage() {
  const bookings = await getUserBookings();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">
                {booking.listings.title}
              </h3>
              <p className="text-gray-600">
                {format(new Date(booking.check_in), "MMM dd, yyyy")} -{" "}
                {format(new Date(booking.check_out), "MMM dd, yyyy")}
              </p>
              <p className="text-blue-600 font-bold mt-2">
                {booking.total_price.toLocaleString()} XAF
              </p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
