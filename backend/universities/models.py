from django.db import models

class University(models.Model):
    name = models.CharField(max_length=200, unique=True, db_index=True)  # indexed for fast search
    town = models.CharField(max_length=120, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['name']  # default order by name

    def __str__(self):
        return self.name
