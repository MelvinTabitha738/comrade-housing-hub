import csv
from django.core.management.base import BaseCommand
from universities.models import University
from django.conf import settings
import os

class Command(BaseCommand):
    help = "Load universities from a CSV file"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            help="Path to the CSV file containing universities",
            default=os.path.join(settings.BASE_DIR, "universities", "universities.csv"),
        )

    def handle(self, *args, **kwargs):
        file_path = kwargs["file"]

        try:
            with open(file_path, newline='', encoding="utf-8") as csvfile:
                reader = csv.DictReader(csvfile)

                for row in reader:
                    name = row["name"].strip()
                    town = row["town"].strip()
                    lat = float(row["lat"])
                    lng = float(row["lng"])   

                    uni, created = University.objects.update_or_create(
                        name=name,
                        defaults={
                            "town": town,
                            "lat": lat,
                            "lng": lng,
                        },
                    )

                    if created:
                        self.stdout.write(self.style.SUCCESS(f"Added {name}"))
                    else:
                        self.stdout.write(self.style.WARNING(f"Updated {name}"))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found: {file_path}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error: {e}"))
