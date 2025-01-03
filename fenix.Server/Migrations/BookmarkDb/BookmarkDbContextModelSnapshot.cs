﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using fenix.Server;

#nullable disable

namespace fenix.Server.Migrations.BookmarkDb
{
    [DbContext(typeof(DTO.BookmarkDbContext))]
    partial class BookmarkDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "9.0.0");

            modelBuilder.Entity("fenix.Server.DTO+Bookmark", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("GitHubResponseRepositoryId")
                        .HasColumnType("INTEGER");

                    b.HasKey("UserId");

                    b.ToTable("Bookmark");
                });
#pragma warning restore 612, 618
        }
    }
}
